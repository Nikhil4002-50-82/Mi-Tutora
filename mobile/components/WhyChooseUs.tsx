import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Clock, Award, Target, Sparkles, DollarSign } from 'lucide-react-native';

export function WhyChooseUs() {
  const highlights = [
    "Verified Tutors",
    "Flexible Scheduling",
    "Negotiable Pricing",
    "Personalized Learning",
    "Proven Results",
    "Expert Support"
  ];

  const features = [
    { icon: Shield, label: "Verified Tutors" },
    { icon: Clock, label: "Flexible Scheduling" },
    { icon: DollarSign, label: "Negotiable Pricing" },
    { icon: Target, label: "Personalized Learning" },
    { icon: Award, label: "Proven Results" },
    { icon: Sparkles, label: "Affordable Pricing" },
  ];

  return (
    <View>
      {/* TICKER */}
      <View className="w-full bg-[#04241f] border-t border-b border-white/10 py-4 overflow-hidden">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {highlights.map((highlight, index) => (
            <View key={index} className="flex-row items-center gap-3 px-6">
              {index % 2 === 0 ? (
                <Award size={16} color="#00a992" />
              ) : (
                <Sparkles size={16} color="#00a992" fill="#00a99220" />
              )}
              <Text className="font-semibold text-sm tracking-widest uppercase text-white/70">
                {highlight}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* MAIN SECTION */}
      <View className="relative py-16 px-4 sm:px-6 overflow-hidden w-full">
        <LinearGradient
          colors={['#063831', '#04241f']}
          style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
        />
        <View className="w-full max-w-7xl mx-auto flex-col gap-12 z-10">
          
          <View>
            <Text className="text-[#00a992] font-bold uppercase tracking-wider mb-4">
              India's Trusted Platform
            </Text>
            <Text className="text-3xl sm:text-4xl font-black leading-tight mb-6 text-white">
              Why Choose Mi Tutora? Experience the difference in quality education.
            </Text>
            <Text className="text-gray-300 text-lg leading-relaxed mb-8">
              We connect students with top-tier, background-verified educators. Whether you need home tuition or interactive online classes, our personalized learning approach ensures 98% of our students achieve their academic goals.
            </Text>
            
            <TouchableOpacity 
              className="px-8 py-4 rounded-full bg-[#00a992] self-start shadow-lg shadow-[#00a992]/20"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-center">Book Free Demo</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-4 w-full">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <View 
                  key={index} 
                  className="bg-white/5 border border-white/10 rounded-2xl p-5 flex-col items-center justify-center w-[47%] min-w-[140px]"
                >
                  <View className="mb-3">
                    <Icon size={32} color="#00a992" />
                  </View>
                  <Text className="font-semibold text-sm text-center text-gray-200">
                    {item.label}
                  </Text>
                </View>
              );
            })}
          </View>
          
        </View>
      </View>
    </View>
  );
}
