// components/ui/button-icon.js
import React from 'react';
import { Button } from './button';
import ButtonLoader from './button-loader';

const ButtonIcon = React.forwardRef(function ButtonIcon({ 
  icon: Icon,
  isLoading = false,
  loadingText = 'Loading...',
  children,
  iconPosition = 'left',
  size = 'default',
  variant = 'default',
  className = '',
  disabled = false,
  ...props 
}, ref) {
  const iconClassName = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const iconSpacing = children ? (iconPosition === 'left' ? 'mr-2' : 'ml-2') : '';

  return (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <ButtonLoader size={iconClassName} />
          {children && <span className="ml-2">{loadingText}</span>}
        </>
      ) : (
        <>
          {iconPosition === 'left' && Icon && (
            <Icon className={`${iconClassName} ${iconSpacing}`} />
          )}
          {children}
          {iconPosition === 'right' && Icon && (
            <Icon className={`${iconClassName} ${iconSpacing}`} />
          )}
        </>
      )}
    </Button>
  );
});

ButtonIcon.displayName = 'ButtonIcon';

export default ButtonIcon;