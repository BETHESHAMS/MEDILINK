import { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Send,
  Paperclip,
  X,
  AlertTriangle,
  Stethoscope,
  Star,
  MapPin,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  User,
  Bot,
  LocateFixed,
} from "lucide-react";
import { detectUserLocation } from "../utils/geolocation";

const API_BASE = "http://127.0.0.1:8000";

const quickPrompts = [
  { label: "Red itchy skin rash", symptoms: "Red itchy skin rash with swelling for 3 days" },
  { label: "Knee pain & walking difficulty", symptoms: "Persistent knee pain and difficulty walking" },
  { label: "Severe chest pain", symptoms: "Severe chest pain and difficulty breathing" },
  { label: "Frequent migraine & dizziness", symptoms: "Frequent migraine and numbness in fingers" },
  { label: "Fever & body ache", symptoms: "High fever, chills, and severe body ache" },
];

export default function SmartIntakeBot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I am MediBot, your personal health intake assistant. How are you feeling today? Describe your symptoms, or upload a photo (e.g. skin conditions, swelling) to get routed to the right specialist.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientContext, setPatientContext] = useState({
    symptoms: "",
    age: "",
    gender: "",
    location: "",
  });
  const [step, setStep] = useState("symptoms"); // symptoms -> context -> doctors
  const [activeSpecialty, setActiveSpecialty] = useState(null);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);

  const fileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addMessage = (sender, content) => {
    const newMsg = {
      id: Date.now(),
      sender,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ...content,
    };
    setMessages((prev) => [...prev, newMsg]);
  };

  const handleAutoDetectLocation = async () => {
    addMessage("user", {
      text: "📍 Requesting my current GPS location...",
    });
    setLoading(true);

    try {
      const loc = await detectUserLocation();
      const detectedCity = loc.formatted || loc.city || "Current Location";
      setPatientContext((prev) => ({ ...prev, location: detectedCity }));

      const specParam = activeSpecialty ? `specialization=${encodeURIComponent(activeSpecialty)}` : "";
      let doctors = [];

      // Try searching for the detected location
      try {
        const res1 = await axios.get(
          `${API_BASE}/recommend-doctors?${specParam}&location=${encodeURIComponent(loc.city || detectedCity)}`
        );
        doctors = res1.data || [];
      } catch {
        doctors = [];
      }

      // Try fallback to broad city if exact locality had 0
      if (doctors.length === 0 && loc.city) {
        try {
          const res2 = await axios.get(
            `${API_BASE}/recommend-doctors?${specParam}&location=${encodeURIComponent(loc.city)}`
          );
          doctors = res2.data || [];
        } catch {
          // ignore
        }
      }

      setTimeout(async () => {
        if (doctors.length > 0) {
          setRecommendedDoctors(doctors);
          addMessage("bot", {
            text: `📍 GPS Detected: **"${detectedCity}"**.\nFound **${doctors.length} specialist(s)**${
              activeSpecialty ? ` in **${activeSpecialty}**` : ""
            } nearby:`,
            doctorCards: doctors,
          });
        } else {
          try {
            const fallbackRes = await axios.get(`${API_BASE}/recommend-doctors?${specParam}`);
            const fallbackDocs = fallbackRes.data || [];
            const finalDocs = fallbackDocs.length > 0 ? fallbackDocs : (await axios.get(`${API_BASE}/doctors`)).data;
            setRecommendedDoctors(finalDocs);

            addMessage("bot", {
              text: `📍 GPS Detected: **"${detectedCity}"**.\nWe don't have doctors directly registered in ${detectedCity} for ${
                activeSpecialty || "this condition"
              } yet. Here are the top available verified doctors on MediLink:`,
              doctorCards: finalDocs,
            });
          } catch {
            addMessage("bot", {
              text: `📍 GPS Detected: **"${detectedCity}"**. You can also choose or type another city:`,
              quickReplies: ["Delhi", "Noida", "Mumbai", "Any location"],
            });
          }
        }
        setStep("doctors");
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Location error:", err);
      setTimeout(() => {
        addMessage("bot", {
          text: `⚠️ ${err.message || "Could not detect location."}\n\nYou can manually type your city or choose a quick option below:`,
          quickReplies: ["Delhi", "Noida", "Mumbai", "Any location"],
        });
        setLoading(false);
      }, 400);
    }
  };

  const handleSendMessage = async (textToSend = inputText) => {
    const text = textToSend.trim();
    if (!text && !selectedImage) return;

    const lower = text.toLowerCase();

    // Check if user clicked auto detect prompt
    if (
      lower.includes("auto-detect") ||
      lower.includes("auto detect") ||
      lower.includes("detect my location") ||
      text.includes("Auto-detect My Location")
    ) {
      setInputText("");
      handleAutoDetectLocation();
      return;
    }

    // Add user message
    addMessage("user", {
      text,
      image: imagePreview,
    });

    setInputText("");
    const currentImg = imagePreview;
    removeSelectedImage();
    setLoading(true);

    // 1. Reset / Restart intent
    if (lower === "reset" || lower === "restart" || lower === "start over" || lower === "clear") {
      resetChat();
      setLoading(false);
      return;
    }

    // 2. Check if this is a Location Intent
    const isLocationChange =
      step === "context" ||
      lower.includes("location") ||
      lower.includes("delhi") ||
      lower.includes("shahen") ||
      lower.includes("shaheen") ||
      lower.includes("noida") ||
      lower.includes("mumbai") ||
      lower.includes("bangalore") ||
      lower.includes("seattle") ||
      lower.includes("york") ||
      lower.startsWith("in ") ||
      lower.includes("change my location") ||
      lower.includes("change location") ||
      lower.includes("my location");

    // 3. Check if this is a Symptom Intent
    const symptomKeywords = [
      "pain", "ache", "rash", "skin", "fever", "cough", "cold", "headache", "chest",
      "heart", "stomach", "knee", "bone", "joint", "dizzy", "numb", "breath", "bleed",
      "burn", "infection", "sick", "swelling", "migraine", "vomit", "cramp", "itching",
      "throat", "hurts", "hurting"
    ];
    const isSymptom =
      Boolean(currentImg) ||
      step === "symptoms" ||
      symptomKeywords.some((k) => lower.includes(k));

    try {
      if (isLocationChange && !isSymptom) {
        // Clean location string
        let cleanLoc = text
          .replace(/^(no|please|ok|okay)[,\s]+/i, "")
          .replace(/^(change|update)\s+(my\s+)?location\s+(to|in)\s+/i, "")
          .replace(/^my\s+location\s+is\s+/i, "")
          .replace(/^in\s+/i, "")
          .trim();

        if (cleanLoc.toLowerCase().includes("any")) cleanLoc = "";
        setPatientContext((prev) => ({ ...prev, location: cleanLoc }));

        let doctors = [];
        const specParam = activeSpecialty ? `specialization=${encodeURIComponent(activeSpecialty)}` : "";

        // First attempt: clean location
        try {
          const res1 = await axios.get(
            `${API_BASE}/recommend-doctors?${specParam}&location=${encodeURIComponent(cleanLoc)}`
          );
          doctors = res1.data || [];
        } catch {
          doctors = [];
        }

        // Second attempt: if 0 results, check individual city words (e.g. "delhi" or "shaheen")
        if (doctors.length === 0 && cleanLoc) {
          const parts = cleanLoc
            .split(/[\s,]+/i)
            .filter((p) => p.length > 2 && !["in", "near", "at", "the", "my", "bagh"].includes(p.toLowerCase()));

          for (const part of parts) {
            try {
              const resPart = await axios.get(
                `${API_BASE}/recommend-doctors?${specParam}&location=${encodeURIComponent(part)}`
              );
              if (resPart.data && resPart.data.length > 0) {
                doctors = resPart.data;
                break;
              }
            } catch {
              // continue
            }
          }
        }

        setTimeout(async () => {
          if (doctors.length > 0) {
            setRecommendedDoctors(doctors);
            addMessage("bot", {
              text: `📍 Location set to **"${cleanLoc}"**. Found **${doctors.length} specialist(s)**${
                activeSpecialty ? ` in **${activeSpecialty}**` : ""
              }:`,
              doctorCards: doctors,
            });
          } else {
            // Fallback: fetch available specialists across the platform so the user gets actual doctor cards
            try {
              const fallbackRes = await axios.get(
                `${API_BASE}/recommend-doctors?${specParam}`
              );
              const fallbackDocs = fallbackRes.data || [];
              const finalDocs = fallbackDocs.length > 0 ? fallbackDocs : (await axios.get(`${API_BASE}/doctors`)).data;
              setRecommendedDoctors(finalDocs);

              addMessage("bot", {
                text: `📍 Noted location: **"${cleanLoc}"**.\nWe don't have doctors directly registered in ${cleanLoc} for ${
                  activeSpecialty || "this care"
                } yet. Here are verified specialists available across MediLink for consultation:`,
                doctorCards: finalDocs,
              });
            } catch {
              addMessage("bot", {
                text: `📍 Noted location: **"${cleanLoc}"**. No doctors found currently. You can try another city or check another symptom.`,
                quickReplies: ["Delhi", "Noida", "Mumbai", "Check other symptoms"],
              });
            }
          }
          setStep("doctors");
          setLoading(false);
        }, 500);

      } else if (isSymptom) {
        setPatientContext((prev) => ({ ...prev, symptoms: text }));

        // Call backend symptom analyzer
        const res = await axios.post(`${API_BASE}/analyze-symptoms`, {
          symptoms: text,
        });

        const { recommended_specialization, emergency } = res.data;
        setActiveSpecialty(recommended_specialization);

        if (emergency) {
          addMessage("bot", {
            text: "⚠️ URGENT MEDICAL WARNING: Your description indicates potentially severe or critical symptoms. Please seek immediate attention at an emergency room or contact emergency services (911/112).",
            isEmergency: true,
          });
          setLoading(false);
          return;
        }

        // Context follow-up
        setTimeout(() => {
          addMessage("bot", {
            text: `Based on your symptoms${currentImg ? " and attached photo" : ""}, this is recommended for a **${recommended_specialization}**.\n\nWhich city or area are you located in? You can use Auto-detect or choose below:`,
            quickReplies: ["📍 Auto-detect My Location", "Delhi", "Noida", "Mumbai", "Any location"],
          });
          setStep("context");
          setLoading(false);
        }, 600);

      } else {
        // Conversation continuation / general
        setTimeout(() => {
          addMessage("bot", {
            text: "I can help route you to the right doctor or update your preferences. What would you like to do?",
            quickReplies: [
              "Change location to Delhi",
              "Check new symptoms",
              "Show all doctors",
            ],
          });
          setLoading(false);
        }, 400);
      }
    } catch (err) {
      console.error("API error:", err);
      addMessage("bot", {
        text: "I encountered an error connecting to the MediLink server. Please make sure the backend is running at http://127.0.0.1:8000.",
        isError: true,
      });
      setLoading(false);
    }
  };

  const handleSelectDoctor = async (doctor) => {
    setBookingDoctor(doctor);
    setBookingStatus(null);
    setSelectedSlot("");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // If tomorrow is Sunday, pick Monday
    if (tomorrow.getDay() === 0) tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    setBookingDate(dateStr);

    try {
      const res = await axios.get(`${API_BASE}/doctors/${doctor.id}/available-slots?date=${dateStr}`);
      setAvailableSlots(res.data.available_slots || []);
    } catch {
      setAvailableSlots([]);
    }
  };

  const handleDateChange = async (newDate) => {
    setBookingDate(newDate);
    setSelectedSlot("");
    if (!bookingDoctor) return;
    try {
      const res = await axios.get(`${API_BASE}/doctors/${bookingDoctor.id}/available-slots?date=${newDate}`);
      setAvailableSlots(res.data.available_slots || []);
    } catch {
      setAvailableSlots([]);
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) {
      alert("Please choose a time slot");
      return;
    }
    setBookingStatus({
      success: true,
      doctor: bookingDoctor.name,
      date: bookingDate,
      time: selectedSlot,
    });

    addMessage("bot", {
      text: `🎉 Appointment successfully selected with **${bookingDoctor.name}** for **${bookingDate} at ${selectedSlot}**! Please log in or register to confirm and finalize your booking.`,
    });

    setBookingDoctor(null);
  };

  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: "Welcome back! What symptoms would you like me to evaluate?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setStep("symptoms");
    setActiveSpecialty(null);
    setRecommendedDoctors([]);
    setBookingDoctor(null);
  };

  return (
    <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-blue-500/10">
      {/* Bot Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold tracking-tight">MediBot Health Intake</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live AI Triage
              </span>
            </div>
            <p className="text-xs text-blue-100/90">Symptom analysis, image intake & doctor matching</p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
          title="Restart conversation"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      </div>

      {/* Message Area */}
      <div className="h-[480px] overflow-y-auto bg-slate-50/50 p-6 space-y-5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {msg.sender === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble Content */}
            <div className={`max-w-[85%] space-y-2 ${msg.sender === "user" ? "items-end" : ""}`}>
              {msg.isEmergency ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <AlertTriangle size={20} />
                    Emergency Notice
                  </div>
                  <p className="mt-2 text-sm leading-relaxed">{msg.text}</p>
                </div>
              ) : (
                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-100 rounded-tl-none"
                  }`}
                >
                  {/* Attached user image */}
                  {msg.image && (
                    <div className="mb-2 overflow-hidden rounded-xl border border-blue-400/40">
                      <img
                        src={msg.image}
                        alt="Uploaded symptom"
                        className="max-h-48 w-full object-cover"
                      />
                    </div>
                  )}
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>
              )}

              {/* Quick Reply Chips */}
              {msg.quickReplies && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {msg.quickReplies.map((reply) => (
                    <button
                      key={reply}
                      onClick={() => handleSendMessage(reply)}
                      className="rounded-full border border-blue-200 bg-white px-3.5 py-1.5 text-xs font-medium text-blue-700 shadow-sm transition hover:bg-blue-50 hover:border-blue-300"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Doctor Recommendation Cards */}
              {msg.doctorCards && msg.doctorCards.length > 0 && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2 pt-1">
                  {msg.doctorCards.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900">{doc.name}</h4>
                            <span className="inline-block mt-0.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                              {doc.specialization}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                            <Star size={13} className="fill-amber-400 text-amber-400" />
                            {doc.rating || "5.0"}
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                          <p className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-slate-400" />
                            {doc.hospital}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-slate-400" />
                            {doc.location}
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400" />
                            {doc.experience} yrs exp • {doc.availability}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectDoctor(doc)}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        <Calendar size={14} />
                        Check Slots & Book
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <span className="block text-[11px] text-slate-400">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs pl-11">
            <Sparkles size={14} className="animate-spin text-blue-500" />
            MediBot is analyzing symptoms and finding specialists...
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Bar (when on initial symptoms step) */}
      {step === "symptoms" && (
        <div className="border-t border-slate-100 bg-white px-5 py-2.5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested Symptoms to test:
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickPrompts.map((p) => (
              <button
                key={p.label}
                onClick={() => handleSendMessage(p.symptoms)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-blue-400 hover:bg-blue-50/50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Image Preview Bar */}
      {imagePreview && (
        <div className="flex items-center justify-between border-t border-blue-100 bg-blue-50/50 px-5 py-2">
          <div className="flex items-center gap-3">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-10 w-10 rounded-lg object-cover border border-blue-200"
            />
            <span className="text-xs font-medium text-slate-700 truncate max-w-xs">
              {selectedImage?.name} (Ready to attach)
            </span>
          </div>
          <button
            onClick={removeSelectedImage}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="border-t border-slate-100 bg-white p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* File Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            title="Attach a symptom photo (e.g. skin rash)"
          >
            <Paperclip size={18} />
          </button>

          {/* Auto-detect Location Button */}
          <button
            type="button"
            onClick={handleAutoDetectLocation}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
            title="Auto-detect current location (GPS)"
          >
            <LocateFixed size={18} />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your symptoms (e.g. skin rash, joint ache, fever)..."
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !selectedImage}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="mt-2.5 flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-500" />
            Confidential intake • Encrypted data
          </span>
          <span>MediLink Smart Triage v1.0</span>
        </div>
      </div>

      {/* Booking Slot Modal Drawer */}
      {bookingDoctor && (
        <div className="border-t border-blue-100 bg-blue-50/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-900">
                Book Slot with {bookingDoctor.name}
              </h4>
              <p className="text-xs text-slate-600">
                {bookingDoctor.specialization} • {bookingDoctor.hospital}
              </p>
            </div>
            <button
              onClick={() => setBookingDoctor(null)}
              className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Date:
              </label>
              <input
                type="date"
                value={bookingDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available 30-min Slots:
              </label>
              {availableSlots.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-xs text-slate-500">
                  No slots available on this date (e.g. Sunday or fully booked).
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-blue-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setBookingDoctor(null)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBooking}
              disabled={!selectedSlot}
              className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-40"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
