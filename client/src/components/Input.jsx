export const Input = ({ 
    label, 
    type = "text", 
    placeholder, 
    value, 
    onChange, 
    name 
}) => (
    <div className="mb-5 text-left">
        <label className="block text-gray-700 text-sm font-semibold mb-1.5 ml-1">
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            // Update the text-gray-900 class below
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-gray-400 bg-gray-50/50 hover:bg-gray-50 text-gray-900"
            required
        />
    </div>
);