<script lang="ts"></script>
import { AlertCircle, UserMinus, UserPlus, Clock, Info } from 'lucide-react'

type SystemMessageType = 'admin_kick' | 'user_left' | 'user_joined' | 'rate_limited' | 'info'

interface SystemMessageProps {
  type: SystemMessageType
  content: string
}

export default function SystemMessage({ type, content }: SystemMessageProps) {
  const getMessageStyle = () => {
    switch (type) {
      case 'admin_kick':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'user_left':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 'user_joined':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'rate_limited':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'admin_kick':
        return <AlertCircle className="w-4 h-4" />
      case 'user_left':
        return <UserMinus className="w-4 h-4" />
      case 'user_joined':
        return <UserPlus className="w-4 h-4" />
      case 'rate_limited':
        return <Clock className="w-4 h-4" />
      case 'info':
        return <Info className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <div className="flex justify-center my-2">
      <div className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getMessageStyle()}`}>
        {getIcon()}
        <span className="ml-1">{content}</span>
      </div>
    </div>
  )
}

// Example usage
export function ChatMessages() {
  return (
    <div className="space-y-4">
      <div>User message 1</div>
      <SystemMessage type="user_joined" content="Alice joined the room" />
      <div>User message 2</div>
      <SystemMessage type="admin_kick" content="Bob was kicked by admin" />
      <div>User message 3</div>
      <SystemMessage type="user_left" content="Charlie left the room" />
      <div>User message 4</div>
      <SystemMessage type="rate_limited" content="You're sending messages too quickly. Please wait." />
      <div>User message 5</div>
      <SystemMessage type="info" content="This room will be archived in 24 hours" />
    </div>
  )
}