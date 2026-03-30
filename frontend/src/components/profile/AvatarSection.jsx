export default function AvatarSection({ user, avatarLoading, onUpload }) {
  return (
    <section className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0 h-24 w-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
          {user?.avatar_url ? (
            <img src={user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
        <div>
          <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
            {avatarLoading ? 'Uploading...' : 'Change Avatar'}
            <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={avatarLoading} />
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">JPG, GIF or PNG. 1MB max.</p>
        </div>
      </div>
    </section>
  )
}
