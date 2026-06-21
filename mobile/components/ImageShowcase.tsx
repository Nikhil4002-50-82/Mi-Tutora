import React from 'react';
import { View, Text, Image, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function ImageShowcase() {
  const topImages = [
    {
      source: require('../assets/imports/home.jpg'),
      alt: 'Home Tuition',
      label: 'Home Tuition',
    },
    {
      source: require('../assets/imports/online.jpg.jpeg'),
      alt: 'Online Classes',
      label: 'Online Classes',
    },
  ];

  return (
    <View className="py-20 bg-white overflow-hidden px-4 sm:px-6 w-full">
      <View className="w-full max-w-7xl mx-auto flex-col">
        {/* Header */}
        <View className="text-center mb-16">
          <Text className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-4 leading-tight">
            Learning That Fits Every Student
          </Text>
          <Text className="text-lg text-center text-gray-600 font-medium">
            Experience education tailored to your unique learning style and goals
          </Text>
        </View>

        {/* Top Row - First Two Cards */}
        <View className="flex-col md:flex-row gap-6 mb-6">
          {topImages.map((image, index) => (
            <View key={image.label} className="rounded-2xl overflow-hidden shadow-sm flex-1 bg-slate-100 aspect-[4/3]">
              <ImageBackground
                source={image.source}
                className="w-full h-full justify-end"
                resizeMode="cover"
              >
                <View className="absolute inset-0 justify-end w-full p-6 pt-16">
                  <LinearGradient
                    colors={['transparent', 'rgba(15, 23, 42, 0.8)']}
                    style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}
                  />
                  <Text className="text-white text-lg font-semibold z-10">{image.label}</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </View>

        {/* Bottom Row - Wide Banner */}
        <View className="rounded-2xl overflow-hidden shadow-sm aspect-[21/9] bg-emerald-50 w-full mt-2">
          <Image
            source={require('../assets/imports/3rd_photo.jpg.png')}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
}
