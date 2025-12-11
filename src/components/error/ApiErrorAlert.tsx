// components/error/ApiErrorAlert.tsx
import React from 'react';

interface ApiErrorAlertProps {
    error: string | null;
    onRetry?: () => void;
    onDismiss?: () => void;
    reset?: () => void;
    retryText?: string;
    dismissText?: string;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({
                                                                error,
                                                                onRetry,
                                                                onDismiss,
                                                                reset,
                                                                retryText = 'Повторить попытку',
                                                                dismissText = 'Назад'
                                                            }) => {
    if (!error) return null;

    return (
        <div className="api-error-alert">
            <div className="alert-content">
                <div className="alert-icon">⚠️</div>
                <div className="alert-message">
                    <h3>Ошибка при выполнении запроса</h3>
                    <p>{error}</p>
                </div>
                <div className="alert-actions">
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="alert-button retry"
                        >
                            {retryText}
                        </button>
                    )}
                    {onDismiss && (
                        <button
                            onClick={reset}
                            className="alert-button dismiss"
                        >
                            {dismissText}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};