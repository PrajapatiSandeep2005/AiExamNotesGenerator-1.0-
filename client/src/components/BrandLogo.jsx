import logo from "../assets/logo.png";

function BrandLogo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <img src={logo} alt="" className="h-9 w-9 rounded-full object-cover" />
      <span className="text-lg font-bold text-white">
        ExamNotes <span className="text-[#f5a13b]">AI</span>
      </span>
    </span>
  );
}

export default BrandLogo;
