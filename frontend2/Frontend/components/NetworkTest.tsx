import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const NetworkTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const testConnection = async () => {
    setIsLoading(true);
    setResult('Testing connection...');
    
    try {
      // Test basic connectivity
      const response = await axios.get(API_CONFIG.WEBSOCKET_URL);
      setResult(`✅ Backend connected! Status: ${response.status}`);
      console.log('Backend response:', response.data);
    } catch (error: any) {
      setResult(`❌ Connection failed: ${error.message}`);
      console.error('Connection error:', error);
    }
    
    setIsLoading(false);
  };

  const testAPI = async () => {
    setIsLoading(true);
    setResult('Testing API...');
    
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/users/register`, {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      });
      setResult(`✅ API working! User created: ${response.data.name}`);
      console.log('API response:', response.data);
    } catch (error: any) {
      setResult(`❌ API failed: ${error.response?.data?.message || error.message}`);
      console.error('API error:', error);
    }
    
    setIsLoading(false);
  };

  const testPostsAPI = async () => {
    setIsLoading(true);
    setResult('Testing Posts API...');
    
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/posts/feed`);
      setResult(`✅ Posts API working! Found ${response.data.posts?.length || 0} posts`);
      console.log('Posts API response:', response.data);
    } catch (error: any) {
      setResult(`❌ Posts API failed: ${error.message}`);
      console.error('Posts API error:', error);
    }
    
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Test</Text>
      <Text style={styles.subtitle}>Test your backend connection</Text>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testConnection}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testAPI}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test API Registration'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={testPostsAPI}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test Posts API'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{result}</Text>
      </View>
      
      <Text style={styles.info}>
        Backend URL: {API_CONFIG.BASE_URL}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0D0D0D',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EAEAEA',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8E',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#0A84FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    minHeight: 100,
  },
  resultText: {
    color: '#EAEAEA',
    fontSize: 14,
    lineHeight: 20,
  },
  info: {
    color: '#8A8A8E',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default NetworkTest;
