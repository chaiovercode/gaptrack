import { useState, useRef, useEffect } from 'react'
import { useStorage, useAI } from '../../shared/hooks'
import './TerminalChat.css'

const TerminalChat = ({ isOpen, onClose }) => {
    const { data } = useStorage()
    const { chat, isProcessing } = useAI(data?.settings)
    const [history, setHistory] = useState([
        { role: 'assistant', content: 'Daemon initialized. Listening for input...' }
    ])
    const [input, setInput] = useState('')
    const [isMinimized, setIsMinimized] = useState(false)
    const messagesEndRef = useRef(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [history])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!input.trim() || isProcessing) return

        const userMessage = { role: 'user', content: input }
        setHistory(prev => [...prev, userMessage])
        setInput('')

        // Prepare context: Resume + Current View Context?
        // For now, let's pass the parsed Resume.
        // Ideally we also pass the current Job if we are in Job view. 
        // But hooks don't know the current view. 
        // We'll trust the "General Chat" for now.

        // Context: Resume + All Jobs
        const context = {
            resume: data?.resume || null,
            jobs: data?.applications || []
        }
        console.log('--- CHAT DEBUG ---')
        console.log('Sending Context:', context)
        console.log('Full history:', [...history, userMessage])
        console.log('------------------')

        // Determine mode based on settings or random/toggle? 
        // The prompt says "Roast" or "Normal". 
        // Let's default to "Normal" unless the user asks for a roast?
        // Or maybe add a toggle later. For now, "Normal" (Elliot).
        const mode = 'normal'

        const result = await chat([...history, userMessage], context, mode)

        if (result.success) {
            setHistory(prev => [...prev, { role: 'assistant', content: result.text }])
        } else {
            setHistory(prev => [...prev, { role: 'assistant', content: `Error: ${result.error}` }])
        }
    }

    if (!isOpen) return null

    return (
        <div className={`terminal-chat ${isMinimized ? 'minimized' : ''}`}>
            <div className="terminal-header" onClick={() => setIsMinimized(!isMinimized)}>
                <span className="terminal-title">bash --user={data?.resume?.name ? data.resume.name.split(' ')[0].toLowerCase() : 'guest'}</span>
                <div className="terminal-controls">
                    <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized) }}>_</button>
                    <button onClick={(e) => { e.stopPropagation(); onClose() }}>X</button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    <div className="terminal-body">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`terminal-line ${msg.role}`}>
                                <span className="prompt">{msg.role === 'user' ? '>' : '$'}</span>
                                <span className="content">{msg.content}</span>
                            </div>
                        ))}
                        {isProcessing && (
                            <div className="terminal-line assistant">
                                <span className="prompt">$</span>
                                <span className="content cursor-blink">...</span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <form className="terminal-input-form" onSubmit={handleSubmit}>
                        <span className="input-prompt">{'>'}</span>
                        <input
                            type="text"
                            className="terminal-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            autoFocus
                            placeholder="Execute command..."
                        />
                    </form>
                </>
            )}
        </div>
    )
}

export default TerminalChat
