// frontend/src/utils/avatarUtils.js
export const generateDefaultAvatar = (name) => {
    // Array of pleasant colors (excluding black and white)
    const colors = [
      '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#34495e',
      '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#2c3e50',
      '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#f39c12',
      '#d35400', '#c0392b', '#7f8c8d'
    ];
    
    // Get first letter and random color
    const firstLetter = name.charAt(0).toUpperCase();
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Generate SVG
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="${randomColor}"/>
        <text x="50" y="50" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">${firstLetter}</text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };