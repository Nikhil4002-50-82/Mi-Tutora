import React from 'react';
import { View, Text, Image } from 'react-native';
import { Star, Quote } from 'lucide-react-native';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Parent',
      image: 'https://images.unsplash.com/photo-1758685848226-eedca8f6bce7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMHRlYWNoZXIlMjBzbWlsaW5nfGVufDF8fHx8MTc3NzMxMTI5M3ww&ixlib=rb-4.1.0&q=80&w=400',
      rating: 5,
      text: "Mi Tutora transformed my daughter's learning experience. Her grades improved dramatically, and she's now confident in Math. The tutors are highly professional and caring.",
    },
    {
      name: 'Rahul Verma',
      role: 'Student - JEE Aspirant',
      image: 'https://images.unsplash.com/photo-1659080925920-1683d25f772a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBzdHVkZW50JTIwc3VjY2VzcyUyMGdyYWR1YXRpb258ZW58MXx8fHwxNzc3MzExMjkzfDA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 5,
      text: 'The NEET coaching at Mi Tutora helped me crack the exam with flying colors. The personalized attention and study materials were exceptional. Highly recommended!',
    },
    {
      name: 'Anjali Patel',
      role: 'Parent',
      image: 'https://images.unsplash.com/photo-1758270705172-07b53627dfcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwc3R1ZGVudHMlMjBncm91cCUyMHN0dWR5aW5nJTIwdG9nZXRoZXJ8ZW58MXx8fHwxNzc3MzExMjkzfDA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 5,
      text: "Excellent service! My son's coding skills have improved tremendously. The online classes are interactive and the tutors make learning fun and engaging.",
    },
    {
      name: 'Vikram Singh',
      role: 'Tutor',
      image: 'https://images.unsplash.com/photo-1758612215020-842383aadb9e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBsZWFybmluZyUyMHN0dWRlbnQlMjBsYXB0b3AlMjBzdHVkeXxlbnwxfHx8fDE3NzczMTEyOTJ8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 5,
      text: 'As a tutor with Mi Tutora, I love the flexibility and support. The platform makes it easy to connect with students and the payment process is seamless.',
    },
    {
      name: 'Meera Krishnan',
      role: 'Parent',
      image: 'https://images.unsplash.com/photo-1758687126445-98edd4b15ba6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwbGVhcm5pbmclMjB0dXRvciUyMHRlYWNoaW5nJTIwcHJlbWl1bSUyMGVkdWNhdGlvbnxlbnwxfHx8fDE3NzczMTEyOTF8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 5,
      text: 'Best decision we made for our child\'s education. The home tuition service is top-notch and very affordable. Thank you, Mi Tutora!',
    },
    {
      name: 'Arjun Mehta',
      role: 'Student - Class 12',
      image: 'https://images.unsplash.com/photo-1776178320111-a03c1ce2212e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFjaGVyJTIwbWVudG9yaW5nJTIwc3R1ZGVudCUyMGNsYXNzcm9vbXxlbnwxfHx8fDE3NzczMTEyOTJ8MA&ixlib=rb-4.1.0&q=80&w=400',
      rating: 5,
      text: 'Mi Tutora helped me ace my board exams! The tutors are knowledgeable and explain concepts in a way that\'s easy to understand. Five stars!',
    },
  ];

  return (
    <View className="py-24 bg-white overflow-hidden px-4 sm:px-6 w-full">
      <View className="w-full max-w-7xl mx-auto flex-col">
        
        <View className="text-center mb-16 md:mb-20">
          <Text className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-6 leading-tight">
            What Our Students Say
          </Text>
          <Text className="text-lg text-center text-gray-600 font-medium">
            Real stories from real people who transformed their learning journey
          </Text>
        </View>

        <View className="flex-col md:flex-row flex-wrap gap-8 w-full">
          {testimonials.map((testimonial, index) => (
            <View key={index} className="flex-1 min-w-[280px]">
              <View className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative">
                {/* Quote icon */}
                <View className="absolute top-6 right-6 w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                  <Quote size={20} color="#10b981" />
                </View>

                {/* Rating */}
                <View className="flex-row space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} color="#facc15" fill="#facc15" />
                  ))}
                </View>

                {/* Testimonial text */}
                <Text className="text-slate-600 leading-relaxed mb-6">
                  "{testimonial.text}"
                </Text>

                {/* Author info */}
                <View className="flex-row items-center space-x-4">
                  <View className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/20">
                    <Image
                      source={{ uri: testimonial.image }}
                      className="w-full h-full"
                    />
                  </View>
                  <View className="ml-4">
                    <Text className="font-semibold text-slate-900">{testimonial.name}</Text>
                    <Text className="text-sm text-slate-500">{testimonial.role}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

      </View>
    </View>
  );
}
