import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Something went wrong
          </ThemedText>
          <ThemedText style={styles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </ThemedText>
          <Pressable style={styles.button} onPress={this.handleReset}>
            <ThemedText style={styles.buttonText}>Try Again</ThemedText>
          </Pressable>
          {__DEV__ && this.state.errorInfo && (
            <ThemedText style={styles.stack}>
              {this.state.errorInfo.componentStack}
            </ThemedText>
          )}
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
    color: '#ef4444',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  stack: {
    marginTop: 24,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

