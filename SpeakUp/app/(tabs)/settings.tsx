"use client"

import AsyncStorage from "@react-native-async-storage/async-storage"
import { useRouter } from "expo-router"
import { useEffect, useState } from "react"
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native"

const { width: screenWidth } = Dimensions.get("window")
const isTablet = screenWidth > 768

export default function SettingsScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoPlayAudio, setAutoPlayAudio] = useState(false)
  const [vibrationFeedback, setVibrationFeedback] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [language, setLanguage] = useState("en")
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [rememberLastScreen, setRememberLastScreen] = useState(false)
  const [showTips, setShowTips] = useState(true)
  const [dataSaver, setDataSaver] = useState(false)
  const [compactMode, setCompactMode] = useState(false)
  const [colorBlindMode, setColorBlindMode] = useState(false)
  const [offlineMode, setOfflineMode] = useState(false)
  const [developerMode, setDeveloperMode] = useState(false)
  const [backgroundMusic, setBackgroundMusic] = useState(false)
  const [showProgressBar, setShowProgressBar] = useState(true)
  const [enableCloudSync, setEnableCloudSync] = useState(false)
  const [pushReminders, setPushReminders] = useState(true)
  const [showWordOfDay, setShowWordOfDay] = useState(true)
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [showAchievements, setShowAchievements] = useState(true)

  const router = useRouter()

  useEffect(() => {
    AsyncStorage.setItem("@darkMode", JSON.stringify(isDarkMode))
  }, [isDarkMode])

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await AsyncStorage.getItem("@darkMode")
      if (stored !== null) setIsDarkMode(JSON.parse(stored))
    }
    loadTheme()
  }, [])

 const handleLogout = async () => {
  await AsyncStorage.clear();
  Alert.alert("Logged out", "You're now logged out.", [
    {
      text: "OK",
      onPress: () => router.push("../index"),
    },
  ]);
};


  const dynamicStyles = isDarkMode ? darkStyles : lightStyles

  return (
    <View style={[styles.container, dynamicStyles.container]}>
      <Text style={[styles.title, dynamicStyles.text]}>Settings</Text>
      <ScrollView style={{ width: "100%" }} contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Section 1 */}
        <SectionHeader title="General" isDarkMode={isDarkMode} />
        <SettingToggle label="🌙 Dark Mode" value={isDarkMode} onChange={setIsDarkMode} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🔊 Sound" value={soundOn} onChange={setSoundOn} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🔔 Notifications" value={notificationsEnabled} onChange={setNotificationsEnabled} dynamicStyles={dynamicStyles} />

        {/* Section 2 */}
        <SectionHeader title="Playback" isDarkMode={isDarkMode} />
        <SettingToggle label="🎧 Auto Play Audio" value={autoPlayAudio} onChange={setAutoPlayAudio} dynamicStyles={dynamicStyles} />
        <SettingToggle label="📳 Vibration Feedback" value={vibrationFeedback} onChange={setVibrationFeedback} dynamicStyles={dynamicStyles} />

        {/* Section 3 */}
        <SectionHeader title="Display" isDarkMode={isDarkMode} />
        <SettingToggle
          label="🔠 Font Size +1"
          value={fontSize > 16}
          onChange={() => setFontSize(fontSize === 16 ? 18 : 16)}
          dynamicStyles={dynamicStyles}
        />
        <SettingToggle label="🌐 Remember Last Screen" value={rememberLastScreen} onChange={setRememberLastScreen} dynamicStyles={dynamicStyles} />
        <SettingToggle label="💡 Show Tips" value={showTips} onChange={setShowTips} dynamicStyles={dynamicStyles} />
        <SettingToggle label="📉 Data Saver" value={dataSaver} onChange={setDataSaver} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🗜️ Compact Mode" value={compactMode} onChange={setCompactMode} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🎨 Color Blind Mode" value={colorBlindMode} onChange={setColorBlindMode} dynamicStyles={dynamicStyles} />

        {/* Section 4 */}
        <SectionHeader title="Advanced" isDarkMode={isDarkMode} />
        <SettingToggle label="📴 Offline Mode" value={offlineMode} onChange={setOfflineMode} dynamicStyles={dynamicStyles} />
        <SettingToggle label="👨‍💻 Developer Mode" value={developerMode} onChange={setDeveloperMode} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🎵 Background Music" value={backgroundMusic} onChange={setBackgroundMusic} dynamicStyles={dynamicStyles} />
        <SettingToggle label="📊 Show Progress Bar" value={showProgressBar} onChange={setShowProgressBar} dynamicStyles={dynamicStyles} />
        <SettingToggle label="☁️ Cloud Sync" value={enableCloudSync} onChange={setEnableCloudSync} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🔁 Auto Update" value={autoUpdate} onChange={setAutoUpdate} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🏆 Show Achievements" value={showAchievements} onChange={setShowAchievements} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🗕️ Push Reminders" value={pushReminders} onChange={setPushReminders} dynamicStyles={dynamicStyles} />
        <SettingToggle label="🌟 Word of the Day" value={showWordOfDay} onChange={setShowWordOfDay} dynamicStyles={dynamicStyles} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

function SectionHeader({
  title,
  isDarkMode,
}: {
  title: string
  isDarkMode: boolean
}) {
  return (
    <View style={[sectionHeaderStyles.container, isDarkMode ? sectionHeaderStyles.darkContainer : sectionHeaderStyles.lightContainer]}>
      <Text style={[sectionHeaderStyles.text, isDarkMode ? sectionHeaderStyles.darkText : sectionHeaderStyles.lightText]}>
        {title.toUpperCase()}
      </Text>
    </View>
  )
}

function SettingToggle({
  label,
  value,
  onChange,
  dynamicStyles,
}: {
  label: string
  value: boolean
  onChange: (v: boolean) => void
  dynamicStyles: any
}) {
  return (
    <View style={[styles.toggleRow, dynamicStyles.toggleRow]}>
      <Text style={[styles.label, dynamicStyles.text]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#ccc", true: "#4a90e2" }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 1,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 17,
    fontWeight: "400",
  },
  logoutButton: {
    backgroundColor: "#ff3b30",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 40,
    marginBottom: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
})

const darkStyles = StyleSheet.create({
  container: {
    backgroundColor: "#121212",
  },
  text: {
    color: "#fff",
  },
  toggleRow: {
    borderBottomColor: "#303030",
  },
})

const lightStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f2f2f7",
  },
  text: {
    color: "#1c1c1e",
  },
  toggleRow: {
    borderBottomColor: "#c6c6c8",
  },
})

const sectionHeaderStyles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },
  darkContainer: {
    backgroundColor: "#181818",
  },
  lightContainer: {
    backgroundColor: "#f2f2f7",
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
  },
  darkText: {
    color: "#888",
  },
  lightText: {
    color: "#6e6e73",
  },
})
