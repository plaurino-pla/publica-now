'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/dashboard/page-header'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  Mail, 
  Palette, 
  Image as ImageIcon, 
  Save, 
  Upload, 
  Eye,
  EyeOff,
  Camera,
  Globe,
  FileText
} from 'lucide-react'

interface CreatorProfile {
  id: string
  name: string
  slug: string
  storeDomain: string
  branding: any | null // JSON object for PostgreSQL
  createdAt: string
  updatedAt: string
}

interface UserProfile {
  id: string
  email: string
}

export default function AccountPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [creator, setCreator] = useState<CreatorProfile | null>(null)
  const [user, setUser] = useState<UserProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    creatorName: '',
    description: '',
    mainColor: '#3B82F6',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePicture: '', // Added for profile picture preview
    headerImage: '' // Added for header image preview
  })

  // File states
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [headerImage, setHeaderImage] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string>('')
  const [headerPreview, setHeaderPreview] = useState<string>('')

  async function compressImage(file: File, maxDim = 2000, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        const scale = Math.min(1, maxDim / Math.max(width, height))
        width = Math.round(width * scale)
        height = Math.round(height * scale)
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob((blob) => {
          if (!blob) return resolve(file)
          const compressed = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' })
          resolve(compressed)
        }, 'image/jpeg', quality)
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const [creatorRes, userRes] = await Promise.all([
        fetch('/api/me/creator'),
        fetch('/api/me/user')
      ])

      if (creatorRes.ok) {
        const creatorData = await creatorRes.json()
        setCreator(creatorData)
        
        // Parse branding data
        const branding = creatorData.branding && typeof creatorData.branding === 'object' ? creatorData.branding : {}
        
        setFormData(prev => ({
          ...prev,
          creatorName: creatorData.name || '',
          description: branding.description || '',
          mainColor: branding.mainColor || '#3B82F6',
          profilePicture: branding.profileImage || '', // Load existing profile image
          headerImage: branding.headerImage || '' // Load existing header image
        }))

        // Load existing profile and header images
        if (branding.profileImage) {
          setProfilePreview(branding.profileImage)
          console.log('Loaded existing profile image:', branding.profileImage)
        }
        if (branding.headerImage) {
          setHeaderPreview(branding.headerImage)
          console.log('Loaded existing header image:', branding.headerImage)
        }
      }

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
        setFormData(prev => ({
          ...prev,
          email: userData.email || ''
        }))
      }
    } catch (err) {
      setError('Failed to load profile data')
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
    setSuccess('')
  }

  const handleFileChange = async (file: File | null, type: 'profile' | 'header') => {
    console.log('handleFileChange called:', { file, type })
    
    if (!file) {
      console.log('No file selected')
      return
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      console.log('File read successfully, result length:', result.length)
      
      if (type === 'profile') {
        setProfileImage(file)
        setProfilePreview(result)
        console.log('Profile image set')
      } else {
        setHeaderImage(file)
        setHeaderPreview(result)
        console.log('Header image set')
      }
    }
    
    reader.onerror = (error) => {
      console.error('Error reading file:', error)
      setError('Failed to read image file')
    }
    
    const maybeCompressed = file.size > 3.5 * 1024 * 1024 ? await compressImage(file) : file
    reader.readAsDataURL(maybeCompressed)
    setError('')
  }

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleFileChange(file, 'profile');
    }
  };

  const handleHeaderImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      handleFileChange(file, 'header');
    }
  };

  const handleCreatorSubmit = async (e?: React.FormEvent) => {
    // Prevent form submission and page refresh
    if (e) {
      e.preventDefault()
    }
    
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // Upload images first if selected
      let profileImageUrl = ''
      let headerImageUrl = ''

      if (profileImage) {
        try {
          const formData = new FormData()
          formData.append('image', profileImage)
          const uploadRes = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData
          })
          
          if (uploadRes.ok) {
            const data = await uploadRes.json()
            profileImageUrl = data.url
            console.log('Profile image uploaded successfully:', data.url)
          } else {
            const errorData = await uploadRes.json()
            throw new Error(`Profile image upload failed: ${errorData.error || 'Unknown error'}`)
          }
        } catch (uploadError) {
          console.error('Profile image upload error:', uploadError)
          throw new Error(`Failed to upload profile image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
        }
      }

      if (headerImage) {
        try {
          const formData = new FormData()
          formData.append('image', headerImage)
          const uploadRes = await fetch('/api/upload/image', {
            method: 'POST',
            body: formData
          })
          
          if (uploadRes.ok) {
            const data = await uploadRes.json()
            headerImageUrl = data.url
            console.log('Header image uploaded successfully:', data.url)
          } else {
            const errorData = await uploadRes.json()
            throw new Error(`Header image upload failed: ${errorData.error || 'Unknown error'}`)
          }
        } catch (uploadError) {
          console.error('Header image upload error:', uploadError)
          throw new Error(`Failed to upload header image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`)
        }
      }

      // Update creator profile
      const branding = {
        description: formData.description,
        mainColor: formData.mainColor,
        profileImage: profileImageUrl || (creator?.branding && typeof creator.branding === 'object' ? (creator.branding as any).profileImage : ''),
        headerImage: headerImageUrl || (creator?.branding && typeof creator.branding === 'object' ? (creator.branding as any).headerImage : '')
      }

      const creatorRes = await fetch('/api/me/creator', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.creatorName,
          branding: branding
        })
      })

      if (creatorRes.ok) {
        setSuccess('Creator profile updated successfully!')
        
        // Only clear image state if images were actually uploaded
        if (profileImageUrl) {
          setProfileImage(null)
          setProfilePreview('')
        }
        if (headerImageUrl) {
          setHeaderImage(null)
          setHeaderPreview('')
        }
        
        // Update local creator state with new branding
        if (creator) {
          setCreator({
            ...creator,
            name: formData.creatorName,
            branding: branding,
            updatedAt: new Date().toISOString()
          })
        }
        
        // Don't call fetchProfile() to avoid page refresh
        console.log('Profile updated successfully, local state updated')
      } else {
        const errorData = await creatorRes.json()
        setError(errorData.error || 'Failed to update creator profile')
      }
    } catch (err) {
      console.error('Creator profile update error:', err)
      setError(err instanceof Error ? err.message : 'Failed to update creator profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all password fields')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/me/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      })

      if (response.ok) {
        setSuccess('Password updated successfully!')
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update password')
      }
    } catch (err) {
      setError('Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="My Account" subtitle="Manage your profile and account settings" />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Creator Profile */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="w-6 h-6 text-gray-600" />
                  Creator Profile
                </CardTitle>
                <CardDescription>
                  Customize your creator profile and branding. Complete your profile to improve discoverability and build trust with your audience.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCreatorSubmit}>
                <CardContent className="space-y-6">
                {/* Creator Name */}
                <div>
                  <label htmlFor="creatorName" className="block text-sm font-medium text-gray-700 mb-2">
                    Creator Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="creatorName"
                    name="creatorName"
                    type="text"
                    value={formData.creatorName}
                    onChange={(e) => setFormData(prev => ({ ...prev, creatorName: e.target.value }))}
                    placeholder="Enter your creator name"
                    className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">This is how readers will know you. Choose a memorable name that reflects your brand.</p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Bio Description <span className="text-brand-500">★</span>
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Tell your audience about yourself and your content"
                    rows={4}
                    className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-brand-600 font-medium">Recommended:</span> A compelling bio helps readers understand your expertise and what to expect from your content.
                  </p>
                </div>

                {/* Main Color */}
                <div>
                  <label htmlFor="mainColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Color <span className="text-brand-500">★</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="mainColor"
                      name="mainColor"
                      value={formData.mainColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, mainColor: e.target.value }))}
                      className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={formData.mainColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, mainColor: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="text-brand-600 font-medium">Recommended:</span> Choose a color that represents your brand and will be used across your profile and content.
                  </p>
                </div>

                {/* Profile Picture */}
                <div>
                  <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture <span className="text-brand-500">★</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {formData.profilePicture ? (
                        <img 
                          src={formData.profilePicture} 
                          alt="Profile preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <Input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        <span className="text-brand-600 font-medium">Recommended:</span> Use a high-quality, professional image (square format, at least 400x400px).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Header Image */}
                <div>
                  <label htmlFor="headerImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Header Image <span className="text-brand-500">★</span>
                  </label>
                  <div className="space-y-3">
                    <div className="w-full h-32 rounded-lg bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden">
                      {formData.headerImage ? (
                        <img 
                          src={formData.headerImage} 
                          alt="Header preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No header image selected</p>
                        </div>
                      )}
                    </div>
                    <Input
                      type="file"
                      id="headerImage"
                      accept="image/*"
                      onChange={handleHeaderImageChange}
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      <span className="text-brand-600 font-medium">Recommended:</span> Use a wide banner image (1200x400px) that showcases your brand or content theme.
                    </p>
                  </div>
                </div>

                {/* Profile Completion Indicator */}
                <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-600 text-xs font-medium">i</span>
                    </div>
                    <h4 className="font-medium text-brand-900">Profile Completion</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-800">Required fields</span>
                      <span className="text-brand-600 font-medium">1/1</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-brand-800">Recommended fields</span>
                      <span className="text-brand-600 font-medium">4/4</span>
                    </div>
                    <div className="w-full bg-brand-200 rounded-full h-2">
                      <div className="bg-brand-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                    <p className="text-xs text-brand-700">
                      Complete your profile to improve discoverability and build trust with your audience.
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Creator Profile
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </form>
            </Card>

            {/* Personal Information */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-gray-600" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your email address and password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter your email address"
                    className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                  />
                </div>

                {/* Password Change */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Change Password</h4>
                  
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        name="currentPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.currentPassword}
                        onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Enter current password"
                        className="border-gray-300 focus:border-gray-400 focus:ring-gray-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      className="border-gray-300 focus:border-gray-400 focus:ring-gray-400"
                    />
                  </div>

                  {/* Save Password Button */}
                  <div className="pt-4">
                    <Button 
                      onClick={handlePasswordSubmit}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full border-gray-300 hover:border-gray-400"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Preview */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Profile Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-gray-300 flex items-center justify-center mx-auto mb-4">
                    {profilePreview ? (
                      <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{formData.creatorName || 'Your Name'}</h3>
                  <p className="text-gray-600 text-sm mb-4">{formData.description || 'No description yet'}</p>
                  <div className="flex items-center justify-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: formData.mainColor }}
                    ></div>
                    <span className="text-xs text-gray-500">Brand color</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {creator?.createdAt ? new Date(creator.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last updated</span>
                  <span className="text-sm font-medium text-gray-900">
                    {creator?.updatedAt ? new Date(creator.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Creator slug</span>
                  <span className="text-sm font-medium text-gray-900 font-mono">{creator?.slug || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

