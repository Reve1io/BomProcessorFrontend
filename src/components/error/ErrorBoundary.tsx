import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Отправка ошибки в сервис мониторинга (опционально)
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Можно использовать кастомный fallback или дефолтный
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="error-boundary">
                    <div className="error-content">
                        <h2>Что-то пошло не так 😞</h2>
                        <p className="error-message">
                            {this.state.error?.message || 'Произошла неожиданная ошибка'}
                        </p>
                        <details className="error-details">
                            <summary>Подробности ошибки</summary>
                            <pre>{this.state.error?.stack}</pre>
                            {this.state.errorInfo && (
                                <pre>{this.state.errorInfo.componentStack}</pre>
                            )}
                        </details>
                        <button
                            onClick={this.handleReset}
                            className="retry-button"
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}