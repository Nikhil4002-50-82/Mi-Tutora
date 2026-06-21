import { ScrollView, View } from 'react-native';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { TrustSection } from '../components/TrustSection';
import { WhyChooseUs } from '../components/WhyChooseUs';
import { ImageShowcase } from '../components/ImageShowcase';
import { ServicesGrid } from '../components/ServicesGrid';
import { TutorJoin } from '../components/TutorJoin';
import { Testimonials } from '../components/Testimonials';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white">
      <Navbar />
      <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
        <Hero />
        <TrustSection />
        <WhyChooseUs />
        <ImageShowcase />
        <ServicesGrid />
        <TutorJoin />
        <Testimonials />
      </ScrollView>
    </View>
  );
}

