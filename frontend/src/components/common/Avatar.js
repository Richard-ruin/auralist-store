// components/common/Avatar.js
import React, { useState } from 'react';

const Avatar = ({ avatar, name, size = 'w-8 h-8', textSize = 'text-sm' }) => {
  const [showFallback, setShowFallback] = useState(!avatar);

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('data:')) return avatarPath;
    return `${process.env.REACT_APP_IMAGE_BASE_URL}/profiles/${avatarPath}`;
  };

  if (showFallback) {
    return (
      <div 
        className={`${size} rounded-full bg-indigo-100 flex items-center justify-center`}
        title={name}
      >
        <span className={`${textSize} font-medium text-indigo-700`}>
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={getAvatarUrl(avatar)}
      alt={name}
      className={`${size} rounded-full object-cover`}
      onError={() => setShowFallback(true)}
    />
  );
};

export default Avatar;