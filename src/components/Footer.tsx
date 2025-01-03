export default function Footer(){

    const year = new Date().getFullYear();


    return (
        <footer className="h-20  bg-white    text-[#111827] flex items-center justify-center  capitalize">
        Built with care to keep you safe ⚡️❤️ © <span >{year }</span>
        </footer>
    ) 
} 