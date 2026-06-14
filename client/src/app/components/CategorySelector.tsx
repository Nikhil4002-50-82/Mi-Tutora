import { motion } from 'motion/react';
import {
  GraduationCap,
  Code,
  Languages,
} from 'lucide-react';

interface Props {
  title: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

export default function CategorySelector({
  title,
  onSelect,
  onClose,
}: Props) {

  const categories = [
    {
      id: 'school',
      title: 'School & College Tuition',
      description:
        'Pre-Nursery, KG, 1st-12th, CBSE, ICSE, State Board, NEET, JEE, KCET',
      icon: GraduationCap,
    },

    {
      id: 'programming',
      title: 'Programming Courses',
      description:
        'Python, Java, AI & ML, Data Analytics, Gen AI, Agentic AI, HTML',
      icon: Code,
    },

    {
      id: 'languages',
      title: 'Language Training',
      description:
        'English, Arabic, German, Japanese, Spoken English, IELTS',
      icon: Languages,
    },
  ];

  return (
    <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 w-full max-w-4xl"
      >

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">

          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="text-slate-500 mt-2">
              Choose your category
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-black"
          >
            ✕
          </button>

        </div>

        {/* CATEGORY CARDS */}
        <div className="grid md:grid-cols-3 gap-6">

          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(item.id)}
                className="border-2 border-slate-200 hover:border-[#00a992] rounded-2xl p-6 text-left transition-all"
              >

                <div className="w-14 h-14 rounded-2xl bg-[#00a992]/10 flex items-center justify-center mb-5">
                  <Icon className="w-7 h-7 text-[#00a992]" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>

                <p className="text-slate-500 leading-relaxed text-sm">
                  {item.description}
                </p>

              </motion.button>
            );
          })}

        </div>

      </motion.div>
    </div>
  );
}