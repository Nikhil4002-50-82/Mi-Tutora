import React from 'react';
import { View, Text } from 'react-native';
import { Award, Users, TrendingUp, Globe } from 'lucide-react-native';

export function TrustSection() {
  const stats = [
    {
      icon: Users,
      number: '10,000+',
      label: 'Active Students',
      description: 'Learning across India',
    },
    {
      icon: Award,
      number: '500+',
      label: 'Verified Tutors',
      description: 'Highly qualified educators',
    },
    {
      icon: TrendingUp,
      number: '98%',
      label: 'Success Rate',
      description: 'Students achieving goals',
    },
    {
      icon: Globe,
      number: '50+',
      label: 'Cities',
      description: 'Nationwide coverage',
    },
  ];

  return (
    <View className="py-16 md:py-24 px-4 sm:px-6 bg-white overflow-hidden">
      <View className="w-full text-center items-center mb-12">
        {/* Badge */}
        <View className="flex-row items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
          <View className="w-2 h-2 bg-[#00a992] rounded-full" />
          <Text className="text-xs text-[#063831] font-bold tracking-wide uppercase">
            Proven Excellence
          </Text>
        </View>
        
        {/* Heading */}
        <Text className="text-4xl sm:text-5xl font-black text-center text-gray-900 leading-tight mb-6">
          Trusted by Thousands.{'\n'}
          <Text className="text-[#00a992]">India's fastest-growing platform.</Text>
        </Text>

        <Text className="text-lg text-center text-gray-600 font-medium">
          Join thousands of students who have transformed their academic journey with us. We are committed to providing the highest quality education through our verified, top-tier tutors across the nation.
        </Text>
      </View>

      {/* Stats Grid */}
      <View className="w-full">
        <View className="flex-col md:flex-row flex-wrap gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <View
                key={stat.label}
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-col items-center flex-1 min-w-[250px]"
              >
                <View className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  <Icon size={32} color="#00a992" />
                </View>
                <Text className="text-4xl font-black text-gray-900 mb-2 text-center">
                  {stat.number}
                </Text>
                <Text className="text-lg font-bold text-[#063831] mb-2 text-center">
                  {stat.label}
                </Text>
                <Text className="text-sm font-medium text-gray-500 text-center">
                  {stat.description}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
