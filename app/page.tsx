import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Mic, 
  Image as ImageIcon, 
  Video, 
  Upload, 
  Share2, 
  DollarSign,
  CheckCircle,
  Star,
  Users,
  Zap,
  Shield,
  BarChart3,
  MessageCircle,
  ArrowRight,
  Play
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sell your content{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                your way
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Create, publish and monetize with <strong>zero upfront cost</strong>. 
              Keep <span className="text-green-600 font-semibold">85% of your earnings</span>.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                asChild
              >
                <Link href="/auth/signup">
                  Start publishing free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 px-8 py-4 text-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                asChild
              >
                <Link href="#how-it-works">
                  See how it works
                  <Play className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>No monthly fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <span>Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>Publish instantly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Formats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Publish any type of content
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you write, record, shoot, or create, we've got you covered with 
              beautiful, monetizable content pages.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Text */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Text Articles</h3>
              <p className="text-gray-600">Write and publish articles, newsletters, and long-form content.</p>
            </div>

            {/* Audio */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Mic className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Audio Content</h3>
              <p className="text-gray-600">Share podcasts, music, and audio experiences with your audience.</p>
            </div>

            {/* Images */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <ImageIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Image Galleries</h3>
              <p className="text-gray-600">Showcase photography, art, and visual content beautifully.</p>
            </div>

            {/* Video */}
            <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 transition-all duration-300 group">
              <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Video className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Video Content</h3>
              <p className="text-gray-600">Upload and monetize videos, courses, and live content.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Start earning in 3 simple steps
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From idea to income in minutes, not months. No technical skills required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                1
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create your content</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your text, audio, images, or video. Set your price and publish instantly. 
                No coding or design skills needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                2
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Share & promote</h3>
              <p className="text-gray-600 leading-relaxed">
                Get a beautiful, shareable link for your content. Share on social media, 
                email, or anywhere you connect with your audience.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white text-3xl font-bold">
                3
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Earn money</h3>
              <p className="text-gray-600 leading-relaxed">
                Keep 85% of every sale. Payments are processed securely and automatically. 
                Get paid directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Start publishing today. No hidden fees, no surprises.
          </p>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-blue-100">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Creator Plan</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-6xl font-bold text-blue-600">$0</span>
                <span className="text-2xl text-gray-600">/month</span>
              </div>
              <p className="text-gray-600 mt-2">15% transaction fee on sales</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Unlimited content publishing</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Beautiful content pages</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Built-in payments</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Analytics & insights</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Customer support</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Keep 85% of earnings</span>
              </div>
            </div>
            
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link href="/auth/signup">
                Start publishing free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful tools designed for creators, not corporations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Instant Publishing</h3>
              <p className="text-gray-600">
                Go from idea to published content in minutes. No waiting, no approval process.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Built-in Stripe integration with enterprise-grade security. Your customers' data is protected.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Analytics & Insights</h3>
              <p className="text-gray-600">
                Track your performance, understand your audience, and optimize for growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Join thousands of creators
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Independent creators are already building their businesses and growing their audiences with Publica.now
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "Publica.now made it incredibly easy to start selling my photography. 
                The platform is intuitive and the payments work seamlessly."
              </p>
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-sm text-gray-600">Photographer</div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "I've tried many platforms, but Publica.now is the only one that 
                puts creators first. The 85% revenue share is game-changing."
              </p>
              <div className="font-semibold text-gray-900">Marcus Rodriguez</div>
              <div className="text-sm text-gray-600">Podcaster</div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "From writing to publishing to getting paid, everything just works. 
                It's exactly what independent writers need."
              </p>
              <div className="font-semibold text-gray-900">Emma Thompson</div>
              <div className="text-sm text-gray-600">Writer</div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>10,000+ creators</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>99.9% uptime</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-500" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to start earning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already monetizing their content. 
            Start publishing today - it's completely free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link href="/auth/signup">
                Get started now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-200"
              asChild
            >
              <Link href="/auth/signin">
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Global SiteFooter is rendered in app/layout.tsx */}
    </div>
  )
}
