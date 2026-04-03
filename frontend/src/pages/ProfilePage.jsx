import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { updateProfile, updatePassword, uploadAvatar, deleteAccount } from '../api/auth.api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import AvatarSection from '../components/profile/AvatarSection'
import ProfileInfoForm from '../components/profile/ProfileInfoForm'
import PasswordForm from '../components/profile/PasswordForm'
import DangerZone from '../components/profile/DangerZone'
import '../styles/pages/ProfilePage.css'

export default function ProfilePage() {
    const { user, refreshUser, logout } = useAuth()
    const navigate = useNavigate()

    // Profile Form State
    const [name, setName] = useState(user?.name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [profileLoading, setProfileLoading] = useState(false)

    // Password Form State
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)

    // Avatar Form State
    const [avatarLoading, setAvatarLoading] = useState(false)

    // Delete Account State
    const [deletePassword, setDeletePassword] = useState('')
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setProfileLoading(true)
        try {
            await updateProfile({ name, email })
            await refreshUser()
            toast.success('Profile updated successfully!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile.')
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords don't match.")
        }
        setPasswordLoading(true)
        try {
            await updatePassword({
                current_password: currentPassword,
                password: newPassword,
                password_confirmation: confirmPassword,
            })
            toast.success('Password updated successfully!')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update password.')
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('avatar', file)

        setAvatarLoading(true)
        try {
            await uploadAvatar(formData)
            await refreshUser()
            toast.success('Avatar updated successfully!')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload avatar.')
        } finally {
            setAvatarLoading(false)
            e.target.value = '' // Reset input
        }
    }

    const handleDeleteAccount = async (e) => {
        e.preventDefault()
        setDeleteLoading(true)
        try {
            await deleteAccount(deletePassword)
            toast.success('Account deleted.')
            await logout()
            navigate('/login')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete account. Check password.')
        } finally {
            setDeleteLoading(false)
        }
    }

  return (
    <div className="profile-page">
      <Navbar />
      <main className="profile-page__main">
        <h1 className="profile-page__title">Account Settings</h1>

        <AvatarSection user={user} avatarLoading={avatarLoading} onUpload={handleAvatarUpload} />

        <ProfileInfoForm
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          loading={profileLoading}
          onSubmit={handleProfileUpdate}
        />

        <PasswordForm
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          loading={passwordLoading}
          onSubmit={handlePasswordUpdate}
        />

        <DangerZone
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          deletePassword={deletePassword}
          setDeletePassword={setDeletePassword}
          deleteLoading={deleteLoading}
          onDelete={handleDeleteAccount}
        />
      </main>
    </div>
  )
}
