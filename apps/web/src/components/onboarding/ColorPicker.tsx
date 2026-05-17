import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: string;
  colors: string[];
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, colors, onChange }: Props) {
  return (
    <div>
      <p className="font-pixel text-text-secondary mb-2" style={{ fontSize: '7px' }}>
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(color)}
            className="w-7 h-7 border-2 transition-all"
            style={{
              backgroundColor: color,
              borderColor: value === color ? '#ffd23f' : '#0d0620',
              boxShadow: value === color ? '0 0 0 2px #ffd23f' : undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
}
