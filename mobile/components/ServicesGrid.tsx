import React from 'react';
import { View, Text } from 'react-native';
import { Home, Video, Code, Brain, Sparkles } from 'lucide-react-native';

export function ServicesGrid() {
  const services = [
    {
      icon: Home,
      title: 'Offline Home Tuitions',
      description: 'Personalized one-to-one tutoring at home with expert, background-verified tutors tailored to your learning pace.',
    },
    {
      icon: Video,
      title: 'One-to-One Online Tuitions',
      description: 'Live interactive online classes with dedicated personal attention, digital whiteboards, and recorded sessions.',
    },
    {
      icon: Code,
      title: 'Programming Languages',
      description: 'Learn Java, C++, Python, and other programming languages from basics to advanced, taught by industry experts.',
    },
    {
      icon: Brain,
      title: 'AI & Machine Learning',
      description: 'Master artificial intelligence and machine learning with hands-on, real-world projects and comprehensive guidance.',
    },
    {
      icon: Sparkles,
      title: 'Generative AI',
      description: 'Learn generative AI, ChatGPT, prompt engineering, and modern AI tools to stay ahead in the tech landscape.',
    },
  ];

  return (
    <View className="py-20 px-4 sm:px-6 bg-gray-50 border-t border-gray-200 w-full">
      <View className="w-full max-w-7xl mx-auto flex-col">
        
        <View className="text-center mb-16">
          <Text className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-6 leading-tight">
            Our Services
          </Text>
          <Text className="text-lg text-center text-gray-600 font-medium">
            Comprehensive learning solutions for every subject and skill level. Whether you're preparing for school exams or mastering cutting-edge tech, we have the perfect tutor for you.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-6 w-full">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <View
                key={index}
                className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex-1 min-w-[280px]"
              >
                <View className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 border border-emerald-100">
                  <Icon size={28} color="#00a992" />
                </View>
                <Text className="text-xl font-bold text-gray-900 mb-4">{service.title}</Text>
                <Text className="text-gray-600 text-sm leading-relaxed font-medium">
                  {service.description}
                </Text>
              </View>
            );
          })}
        </View>

      </View>
    </View>
  );
}
