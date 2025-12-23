import AISettings from './AISettings'

function SettingsView({ settings, onSave, onResetApp }) {
    return (
        <div className="settings-page">
            <AISettings
                settings={settings}
                onSave={onSave}
                onResetApp={onResetApp}
            />
        </div>
    )
}

export default SettingsView
