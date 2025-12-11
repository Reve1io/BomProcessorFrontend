// components/common/LoadingErrorWrapper.tsx
import React from 'react';
import { ApiErrorAlert } from './ApiErrorAlert';

interface LoadingErrorWrapperProps {
    isLoading: boolean;
    error: string | null;
    onRetry?: () => void;
    children: React.ReactNode;
    loadingText?: string;
    showRetry?: boolean;
}

export const LoadingErrorWrapper: React.FC<LoadingErrorWrapperProps> = ({
                                                                            isLoading,
                                                                            error,
                                                                            onRetry,
                                                                            children,
                                                                            loadingText = 'Загрузка...',
                                                                            showRetry = true
                                                                        }) => {
    return (
        <div className="loading-error-wrapper">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>{loadingText}</p>
                </div>
            )}

            {error && showRetry && (
                <div className="error-overlay">
                    <ApiErrorAlert
                        error={error}
                        onRetry={onRetry}
                        onDismiss={() => {}}
                    />
                </div>
            )}

            <div className={isLoading ? 'content-loading' : ''}>
                {children}
            </div>
        </div>
    );
};