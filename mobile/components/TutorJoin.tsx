import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground, Linking } from 'react-native';
import { DollarSign, Clock, Users, TrendingUp, CheckCircle } from 'lucide-react-native';

export function TutorJoin() {
  const benefits = [
    'Flexible working hours',
    'Competitive compensation',
    'Work from anywhere',
    'Free training & support',
    'Growing student base',
    'Regular payments',
  ];

  const stats = [
    { icon: DollarSign, value: '₹25k-50k', label: 'Average Monthly Earnings' },
    { icon: Clock, value: 'Flexible', label: 'Working Hours' },
    { icon: Users, value: '500+', label: 'Active Tutors' },
    { icon: TrendingUp, value: '4.9/5', label: 'Average Rating' },
  ];

  return (
    <View className="py-24 bg-white overflow-hidden w-full">
      {/* Background image with overlay */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1776178320111-a03c1ce2212e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwbWVudG9yaW5nJTIwc3R1ZGVudCUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzczMTEyOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080' }}
        className="absolute w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute w-full h-full bg-slate-900/90" />

      <View className="w-full max-w-7xl mx-auto px-4 sm:px-6">
        <View className="flex-col lg:flex-row gap-12 items-center">
          
          {/* Left Content */}
          <View className="w-full lg:w-1/2">
            <Text className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Join as a <Text className="text-emerald-400">Tutor</Text>
            </Text>
            <Text className="text-xl text-slate-300 mb-8 leading-relaxed">
              Share your knowledge, inspire students, and earn while doing what you love. Join India's fastest-growing education platform.
            </Text>

            {/* Benefits */}
            <View className="flex-row flex-wrap gap-4 mb-8 w-full">
              {benefits.map((benefit) => (
                <View key={benefit} className="flex-row items-center space-x-2 w-[45%] mb-2">
                  <CheckCircle size={20} color="#34d399" />
                  <Text className="text-slate-300 ml-2">{benefit}</Text>
                </View>
              ))}
            </View>

            {/* CTA Buttons */}
            <View className="flex-col sm:flex-row gap-4 w-full">
              <TouchableOpacity
                onPress={() => Linking.openURL('tel:+917483034168')}
                className="px-8 py-4 bg-emerald-500 rounded-full flex-row justify-center shadow-lg shadow-emerald-500/30"
              >
                <Text className="text-white font-semibold text-lg text-center">Apply Now</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Linking.openURL('mailto:musharrafak06@gmail.com')}
                className="px-8 py-4 border-2 border-white/30 rounded-full flex-row justify-center"
              >
                <Text className="text-white font-semibold text-lg text-center">Learn More</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Stats */}
          <View className="w-full lg:w-1/2 flex-row flex-wrap gap-6 mt-8 lg:mt-0">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <View
                  key={stat.label}
                  className="bg-white/10 border border-white/20 rounded-2xl p-6 flex-1 min-w-[140px]"
                >
                  <View className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4">
                    <Icon size={24} color="white" />
                  </View>
                  <Text className="text-2xl font-bold text-white mb-2">{stat.value}</Text>
                  <Text className="text-sm text-slate-300">{stat.label}</Text>
                </View>
              );
            })}
          </View>

        </View>
      </View>
    </View>
  );
}
