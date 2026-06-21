import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Users, ArrowRight } from 'lucide-react-native';

export function Hero() {
  return (
    <View className="flex-1 w-full min-h-[600px] relative">
      <LinearGradient
        colors={['#063831', '#04241f']}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <View className="flex-1 w-full px-4 py-12 md:py-20 justify-center">
        <View className="flex-col lg:flex-row gap-8 items-center w-full max-w-7xl mx-auto z-10">
        
        {/* LEFT CONTENT */}
        <View className="w-full">
          {/* Tag */}
          <View className="flex-row items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 self-start">
            <View className="w-2.5 h-2.5 bg-[#00a992] rounded-full" />
            <Text className="text-xs sm:text-sm text-gray-200 font-medium tracking-wide">
              India's #1 Education Platform
            </Text>
          </View>

          {/* Heading */}
          <Text className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
            Trusted Tutors for{'\n'}
            <Text className="text-[#00a992]">Every Student</Text>
          </Text>

          {/* Description */}
          <Text className="text-gray-300 text-base sm:text-lg mb-8 leading-relaxed font-medium">
            Expert Home Tuition, Online Classes, NEET/JEE Coaching & Coding Skills — customized for your academic success.
          </Text>

          {/* Buttons */}
          <View className="flex-col gap-4">
            <TouchableOpacity 
              className="bg-[#00a992] px-6 py-4 rounded-full flex-row items-center justify-center gap-2 shadow-lg shadow-[#00a992]/20"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">Book Free Demo</Text>
              <View className="bg-white rounded-full w-6 h-6 items-center justify-center">
                <ArrowRight size={14} color="#063831" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              className="border border-white/30 px-6 py-4 rounded-full flex-row items-center justify-center gap-2"
              activeOpacity={0.8}
            >
              <Users size={20} color="white" />
              <Text className="text-white font-bold text-base">Become a Tutor</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* RIGHT IMAGE COMPOSITION */}
        <View className="w-full mt-12 items-center justify-center">
          <View className="relative w-full max-w-[500px]">
            <Image
              source={require('../assets/imports/hero.jpg')}
              className="rounded-3xl w-full h-[320px] shadow-2xl border border-white/10"
              resizeMode="cover"
            />

            {/* GLASSMORPHISM INFO CARD */}
            <View className="absolute top-6 -left-2 sm:-left-6 bg-white/20 border border-white/20 p-4 rounded-2xl w-[220px] shadow-2xl">
              <Text className="text-[#00a992] font-bold text-xs mb-1">Personalized Learning</Text>
              <Text className="text-xs text-gray-200 font-medium leading-relaxed">
                One-on-one sessions tailored to your unique learning style and pace.
              </Text>
            </View>

            {/* EXPERIENCE BADGE */}
            <View className="absolute -bottom-4 -right-2 sm:-right-4 bg-[#00a992] rounded-2xl px-5 py-4 shadow-xl border border-[#00a992]/30">
              <Text className="text-xs font-semibold tracking-wider text-emerald-100 uppercase mb-1">Mi Tutora</Text>
              <Text className="text-lg font-black text-white leading-none">10,000+ Students</Text>
            </View>
          </View>
        </View>

        </View>
      </View>
    </View>
  );
}
