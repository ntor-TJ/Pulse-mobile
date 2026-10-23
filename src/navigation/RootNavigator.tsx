import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Bot,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PulseLoader } from '../components/PulseLoader';
import { colors, radius, typography } from '../theme';

// Auth Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/auth/ResetPasswordScreen';

// Main App Screens
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { WorkspaceListScreen } from '../screens/workspace/WorkspaceListScreen';
import { CreateWorkspaceModal } from '../screens/workspace/CreateWorkspaceModal';
import { WorkspaceDetailScreen } from '../screens/workspace/WorkspaceDetailScreen';
import { WorkspaceAttachmentsScreen } from '../screens/workspace/WorkspaceAttachmentsScreen';
import { WorkspaceArchiveScreen } from '../screens/workspace/WorkspaceArchiveScreen';
import { MentorChatScreen } from '../screens/chat/MentorChatScreen';
import { AryaVoiceAssistantModal } from '../screens/voice/AryaVoiceAssistantModal';
import { QuestionnaireScreen } from '../screens/questionnaire/QuestionnaireScreen';
import { SurveysScreen } from '../screens/surveys/SurveysScreen';
import { ValidationReportScreen } from '../screens/reports/ValidationReportScreen';
import { PricingScreen } from '../screens/pricing/PricingScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { TermsPrivacyScreen } from '../screens/settings/TermsPrivacyScreen';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 10;
  const tabHeight = 56 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: typography.fontWeights.medium,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Workspaces',
          tabBarIcon: ({ color, size }) => <FolderKanban size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="MentorChatTab"
        component={MentorChatScreen}
        options={{
          tabBarLabel: 'AI Mentor',
          tabBarIcon: ({ color, size }) => <Bot size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="SurveysTab"
        component={SurveysScreen}
        options={{
          tabBarLabel: 'Surveys',
          tabBarIcon: ({ color, size }) => <Users size={size - 2} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size - 2} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.bg }]}>
        <PulseLoader message="Initializing Axiora Pulse..." />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        // Auth Stack
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Group>
      ) : (
        // Authenticated App Stack
        <Stack.Group>
          <Stack.Screen name="MainApp" component={MainTabs} />
          <Stack.Screen name="WorkspaceDetail" component={WorkspaceDetailScreen} />
          <Stack.Screen name="WorkspaceAttachments" component={WorkspaceAttachmentsScreen} />
          <Stack.Screen name="WorkspaceArchive" component={WorkspaceArchiveScreen} />
          <Stack.Screen name="WorkspaceSurvey" component={SurveysScreen} />
          <Stack.Screen name="InteractiveQuestions" component={QuestionnaireScreen} />
          <Stack.Screen name="ValidationReport" component={ValidationReportScreen} />
          <Stack.Screen name="Pricing" component={PricingScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="TermsPrivacy" component={TermsPrivacyScreen} />

          {/* Modals */}
          <Stack.Screen
            name="CreateWorkspaceModal"
            component={CreateWorkspaceModal}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="AryaVoiceModal"
            component={(props: any) => (
              <AryaVoiceAssistantModal
                visible={true}
                onClose={() => props.navigation.goBack()}
              />
            )}
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
