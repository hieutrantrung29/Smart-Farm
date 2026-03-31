import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const sampleResponses = [
  "Based on the current sensor data, Zone C's soil moisture is critically low at 32%. I recommend starting irrigation immediately for 45 minutes.",
  "The temperature in Zone B has been optimal for lettuce growth over the past week, averaging 22.3°C which is within the ideal range.",
  "I've detected 3 unacknowledged alerts: 2 in Zone C (soil moisture and temperature) and 1 device offline. Would you like me to provide details?",
  "Your irrigation schedule for Zone A is set for 6:00 AM and 6:00 PM daily. The system has completed 14 successful cycles this week.",
  "Device 'Temp Sensor C1' has been offline for 25 minutes. This may require maintenance or battery replacement (current battery: 15%).",
];

export default function Chatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Xin chào ${user?.user_name}! Tôi là trợ lý AI Smart Farm. Tôi có thể giúp bạn giám sát nông trại, phân tích dữ liệu, quản lý cảnh báo và cung cấp các đề xuất. Tôi có thể giúp gì cho bạn hôm nay?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: sampleResponses[Math.floor(Math.random() * sampleResponses.length)],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    'Check zone status',
    'Show critical alerts',
    'Irrigation schedule',
    'Device health report',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Assistant</h2>
          <p className="text-gray-600">Get intelligent insights and recommendations</p>
        </div>
        <Badge className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
          <Sparkles className="w-4 h-4" />
          AI Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setInput(action)}
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Real-time data analysis</li>
                <li>✓ Alert management</li>
                <li>✓ Predictive insights</li>
                <li>✓ Device diagnostics</li>
                <li>✓ Irrigation recommendations</li>
                <li>✓ Crop health monitoring</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle>AI Smart Farm</CardTitle>
                  <p className="text-xs text-gray-600">
                    Sử dụng công nghệ học máy tiên tiến
                  </p>
                </div>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-green-600'
                        : 'bg-gradient-to-br from-purple-500 to-blue-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div
                    className={`flex-1 max-w-[80%] ${
                      message.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about your farm data, devices, or get recommendations..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button onClick={handleSend} className="gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}