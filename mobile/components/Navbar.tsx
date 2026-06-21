import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Phone, Mail, Menu, X } from 'lucide-react-native';
import { Link } from 'expo-router';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <View className="w-full z-50">
      {/* Top Bar */}
      <View className="bg-[#04241f] pt-12">
        <View className="bg-[#04241f] px-4 py-2 flex-row flex-wrap justify-between items-center">
          <View className="flex-row gap-4">
            <View className="flex-row items-center gap-1.5 opacity-90">
              <Phone size={14} color="#00a992" />
              <Text className="font-semibold text-[#00a992] text-xs">Enquiry:</Text>
              <Text className="text-white text-xs">+91 7483034168</Text>
            </View>
            <View className="hidden sm:flex-row items-center gap-1.5 opacity-90 ml-2">
              <Mail size={14} color="#00a992" />
              <Text className="font-semibold text-[#00a992] text-xs">Mail:</Text>
              <Text className="text-white text-xs">mitutoraeducation@gmail.com</Text>
            </View>
          </View>
          <Text className="text-[11px] text-gray-300 font-medium tracking-wide mt-1 sm:mt-0">
            Your Trusted Tuition Partner
          </Text>
        </View>
      </View>

      {/* Main Navbar */}
      <View className="bg-[#063831] px-4 py-3 flex-row items-center justify-between shadow-sm border-b border-transparent relative z-40">
        {/* Logo */}
        <TouchableOpacity activeOpacity={0.8}>
          <Image
            source={require('../assets/imports/logo.png')}
            className="h-12 w-32"
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Mobile Menu Button */}
        <TouchableOpacity
          onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? <X size={24} color="white" /> : <Menu size={24} color="white" />}
        </TouchableOpacity>
      </View>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <View className="absolute top-full left-0 w-full bg-[#063831]/98 px-6 py-6 shadow-2xl z-30 border-b border-white/10">
          {['Services', 'How It Works', 'Testimonials', 'FAQ'].map((item) => (
            <TouchableOpacity key={item} className="w-full py-3 border-b border-white/10">
              <Text className="text-white font-bold text-base">{item}</Text>
            </TouchableOpacity>
          ))}

          <View className="pt-4">
            <Text className="text-white font-bold text-base mb-2">Login</Text>
            <View className="pl-3 space-y-2">
              <TouchableOpacity className="flex-row items-center gap-2.5 py-2">
                <View className="w-1.5 h-1.5 bg-[#00a992] rounded-full" />
                <Text className="text-gray-300 text-sm font-medium">As Student</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center gap-2.5 py-2">
                <View className="w-1.5 h-1.5 bg-[#00a992] rounded-full" />
                <Text className="text-gray-300 text-sm font-medium">As Teacher</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity className="w-full bg-[#00a992] py-3.5 mt-6 items-center justify-center rounded-xl shadow-lg shadow-[#00a992]/20">
            <Text className="text-white font-bold text-base">Book Free Demo</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
