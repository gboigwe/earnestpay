import React from 'react';
import { useEnsName, useEnsAvatar } from 'wagmi';
import { truncateAddress } from '@/lib/utils';

type EnsDisplayProps = {
  address: string;
  className?: string;
  showAddress?: boolean;
  avatarSize?: 'xs' | 'sm' | 'md' | 'lg';
};

export const EnsDisplay: React.FC<EnsDisplayProps> = ({
  address,
  className = '',
  showAddress = true,
  avatarSize = 'md',
}) => {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1, // Mainnet for ENS
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName || undefined,
    chainId: 1, // Mainnet for ENS
  });

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  if (!address) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {ensAvatar ? (
        <img
          src={ensAvatar}
          alt={`${ensName || 'ENS'} avatar`}
          className={`${sizeClasses[avatarSize]} rounded-full`}
          onError={(e) => {
            // Fallback to no avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : null}
      {showAddress && (
        <span className="font-mono text-sm">
          {ensName || truncateAddress(address)}
        </span>
      )}
    </div>
  );
};

export default EnsDisplay;
