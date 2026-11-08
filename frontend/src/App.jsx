
import { useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  HeartPulse,
  Menu,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
  Video,
  X,
} from "lucide-react";

const specialties = [
  { name: "Cardiology", icon: HeartPulse, color: "bg-rose-50 text-rose-600" },
  { name: "Dermatology", icon: Activity, color: "bg-violet-50 text-violet-600" },
  { name: "Neurology", icon: Activity, color: "bg-blue-50 text-blue-600" },
  { name: "Orthopedics", icon: Users, color: "bg-amber-50 text-amber-600" },
  { name: "General Physician", icon: Stethoscope, color: "bg-emerald-50 text-emerald-600" },
];

const features = [
  {
    icon: Search,
    title: "Find the right doctor",
    description: "Discover healthcare professionals by specialty and location.",
  },
  {
    icon: CalendarDays,
    title: "Easy appointment booking",
    description: "Choose available time slots and manage your appointments.",
  },
  {
    icon: ShieldCheck,
    title: "Your health records",
    description: "Keep your medical information organized in one place.",
  },
  {
    icon: Video,
    title: "Connected healthcare",
    description: "A platform designed to bring patients and doctors closer.",
  },
];

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (event) => {
    event.preventDefault();
    alert(
      `Doctor search selected: ${specialty || "Any specialty"} | ${location || "Any location"}`
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-600 p-2 text-white">
              <HeartPulse size={25} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              Medi<span className="text-blue-600">Link</span>
            </span>
          </a>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#home" className="hover:text-blue-600">Home</a>
            <a href="#specialties" className="hover:text-blue-600">Specialties</a>
            <a href="#features" className="hover:text-blue-600">Features</a>
            <a href="#about" className="hover:text-blue-600">About</a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button className="px-4 py-2 font-semibold text-slate-700 hover:text-blue-600">
              Log in
            </button>
            <button className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700">
              Get started <ArrowRight className="ml-2 inline" size={17} />
            </button>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </nav>

        {menuOpen && (
          <div className="space-y-4 border-t border-slate-100 bg-white p-6 md:hidden">
            <a href="#home" className="block">Home</a>
            <a href="#specialties" className="block">Specialties</a>
            <a href="#features" className="block">Features</a>
            <button className="w-full rounded-xl bg-blue-600 p-3 text-white">
              Get started
            </button>
          </div>
        )}
      </header>

      {/* Hero */}
      <main>
        <section id="home" className="overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:grid-cols-2 md:py-28">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700">
                <HeartPulse size={17} />
                Your health, our priority
              </div>

              <h1 className="text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
                Healthcare made
                <span className="block text-blue-600">simpler for you.</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                Find trusted doctors, book appointments and keep your medical
                journey organized — all in one connected platform.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#find-doctor" className="rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-xl shadow-blue-600/20 hover:bg-blue-700">
                  Find a doctor <ArrowRight className="ml-2 inline" size={18} />
                </a>
                <a href="#features" className="rounded-xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 hover:border-blue-300">
                  Explore features
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
                <span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Easy booking</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-500" size={18} /> Secure records</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -right-8 -top-8 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&auto=format&fit=crop&q=85"
                alt="Healthcare professional"
                className="relative h-[420px] w-full rounded-[2rem] object-cover shadow-2xl md:h-[500px]"
              />
              <div className="absolute -bottom-6 -left-5 rounded-2xl bg-white p-5 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    <CalendarDays size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">Easy appointments</p>
                    <p className="text-sm text-slate-500">Book at your convenience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
        <section id="find-doctor" className="relative z-10 mx-auto -mt-1 max-w-5xl px-6 py-12">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 md:p-8">
            <h2 className="mb-5 text-xl font-bold">Find the right doctor for you</h2>
            <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-3">
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              >
                <option value="">All specialties</option>
                {specialties.map((item) => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>

              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location"
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 outline-none focus:border-blue-500"
              />

              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-4 font-semibold text-white hover:bg-blue-700">
                <Search className="mr-2 inline" size={18} /> Search doctors
              </button>
            </form>
          </div>
        </section>

        {/* Specialties */}
        <section id="specialties" className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="font-semibold text-blue-600">OUR SPECIALTIES</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Healthcare for every need
            </h2>
            <p className="mt-3 text-slate-500">Explore medical specialties and find the right care.</p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {specialties.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setSpecialty(item.name);
                    document.getElementById("find-doctor").scrollIntoView({ behavior: "smooth" });
                  }}
                  className="rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className={`mb-5 inline-flex rounded-xl p-4 ${item.color}`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">Explore doctors <ArrowRight className="ml-1 inline" size={14} /></p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 text-center">
              <p className="font-semibold text-blue-600">WHY MEDILINK</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                Everything you need, in one place
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-2xl bg-white p-7 shadow-sm">
                    <div className="mb-5 inline-flex rounded-xl bg-blue-50 p-4 text-blue-600">
                      <Icon size={27} />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-slate-500">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="font-semibold text-blue-600">ABOUT MEDILINK</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Bringing patients and doctors closer.
              </h2>
              <p className="mt-5 leading-8 text-slate-600">
                MediLink aims to make healthcare more accessible by connecting
                patients with doctors and keeping important healthcare
                information organized.
              </p>
              <div className="mt-7 space-y-4">
                <p className="flex items-center gap-3"><CheckCircle2 className="text-blue-600" /> Patient-focused experience</p>
                <p className="flex items-center gap-3"><CheckCircle2 className="text-blue-600" /> Organized medical information</p>
                <p className="flex items-center gap-3"><CheckCircle2 className="text-blue-600" /> Convenient appointment management</p>
              </div>
            </div>
            <div className="rounded-3xl bg-blue-600 p-10 text-white">
              <Stethoscope size={45} />
              <h3 className="mt-6 text-3xl font-bold">Better connections. Better care.</h3>
              <p className="mt-4 leading-7 text-blue-100">
                One platform to support a more connected healthcare experience
                for patients and medical professionals.
              </p>
              <div className="mt-8 flex gap-3">
                <Clock />
                <span>Designed around convenient healthcare access</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 text-slate-300">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 px-6 md:flex-row">
          <div>
            <div className="flex items-center gap-2 text-2xl font-bold text-white">
              <HeartPulse className="text-blue-400" />
              MediLink
            </div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Connecting patients and healthcare professionals through one
              simple platform.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white">Explore</h4>
            <div className="mt-4 space-y-3 text-sm">
              <a href="#home" className="block hover:text-white">Home</a>
              <a href="#specialties" className="block hover:text-white">Specialties</a>
              <a href="#features" className="block hover:text-white">Features</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white">Contact</h4>
            <p className="mt-4 text-sm text-slate-400">Healthcare support coming soon.</p>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-slate-800 px-6 pt-6 text-sm text-slate-500">
          © {new Date().getFullYear()} MediLink. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
