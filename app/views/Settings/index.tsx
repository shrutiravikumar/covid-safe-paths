import React, { useState, useEffect } from 'react';
import {
  ViewStyle,
  View,
  StyleSheet,
  ScrollView,
  TouchableHighlight,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SvgXml } from 'react-native-svg';
import {
  NavigationParams,
  NavigationScreenProp,
  NavigationState,
} from 'react-navigation';

import {
  LOCALE_LIST,
  getLanguageFromLocale,
  getUserLocaleOverride,
  setUserLocaleOverride,
  supportedDeviceLanguageOrEnglish,
} from '../../locales/languages';
import { FeatureFlag } from '../../components/FeatureFlag';
import { NativePicker } from '../../components/NativePicker';
import { Typography } from '../../components/Typography';
import { NavigationBarWrapper } from '../../components/NavigationBarWrapper';
import { isGPS } from '../../COVIDSafePathsConfig';
import GoogleMapsImport from './GoogleMapsImport';
import { Screens, useStatusBarEffect } from '../../navigation';

import { Icons } from '../../assets';
import { Colors, Spacing, Typography as TypographyStyles } from '../../styles';

interface SettingsScreenProps {
  navigation: NavigationScreenProp<NavigationState, NavigationParams>;
}

const SettingsScreen = ({ navigation }: SettingsScreenProps): JSX.Element => {
  const { t, i18n } = useTranslation();

  const [userLocale, setUserLocale] = useState(
    supportedDeviceLanguageOrEnglish(),
  );

  useEffect(() => {
    const setOverrideLocale = async () => {
      const userSelectedLocale = await getUserLocaleOverride();
      if (userSelectedLocale) {
        setUserLocale(getLanguageFromLocale(userSelectedLocale));
      }
    };
    setOverrideLocale();
  }, []);

  useStatusBarEffect('light-content');

  const navigateTo = (screen: string) => {
    return () => navigation.navigate(screen);
  };

  const localeChanged = async (locale: string) => {
    try {
      await setUserLocaleOverride(locale);
      setUserLocale(locale);
    } catch (e) {
      console.log('something went wrong in lang change', e);
    }
  };

  interface LanguageSelectionListItemProps {
    icon: string;
    label: string;
    onPress: () => void;
  }

  const LanguageSelectionListItem = ({
    icon,
    label,
    onPress,
  }: LanguageSelectionListItemProps) => {
    const iconStyle =
      i18n.dir() === 'rtl'
        ? { marginLeft: Spacing.xSmall }
        : { marginRight: Spacing.xSmall };

    const flexDirection = i18n.dir() === 'rtl' ? 'row-reverse' : 'row';

    return (
      <TouchableHighlight
        underlayColor={Colors.underlayPrimaryBackground}
        style={[styles.listItem]}
        onPress={onPress}>
        <View style={{ flexDirection, alignItems: 'center' }}>
          <SvgXml xml={icon} style={[styles.icon, iconStyle]} />
          <Typography use={'body1'}>{label}</Typography>
        </View>
      </TouchableHighlight>
    );
  };

  interface SettingsListItemProps {
    label: string;
    onPress: () => void;
    description?: string;
    style?: ViewStyle;
  }

  const SettingsListItem = ({
    label,
    onPress,
    description,
    style,
  }: SettingsListItemProps) => {
    return (
      <TouchableHighlight
        underlayColor={Colors.underlayPrimaryBackground}
        style={[styles.listItem, style]}
        onPress={onPress}>
        <View>
          <Typography style={styles.listItemText}>{label}</Typography>
          {description ? (
            <Typography style={styles.descriptionText}>
              {description}
            </Typography>
          ) : null}
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <NavigationBarWrapper
      title={t('navigation.more')}
      includeBackButton={false}>
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <NativePicker
            items={LOCALE_LIST}
            value={userLocale}
            onValueChange={localeChanged}>
            {({
              label,
              openPicker,
            }: {
              label: string;
              openPicker: () => void;
            }) => (
              <LanguageSelectionListItem
                label={label || t('label.unknown')}
                icon={Icons.LanguagesIcon}
                onPress={openPicker}
              />
            )}
          </NativePicker>
        </View>

        {!isGPS && (
          <View style={styles.section}>
            <SettingsListItem
              label={t('settings.share_test_result')}
              onPress={navigateTo('ExportFlow')}
              description={t('settings.share_test_result_description')}
              style={styles.lastListItem}
            />
          </View>
        )}

        {isGPS ? (
          <FeatureFlag name={'google_import'}>
            <View style={styles.section}>
              <View style={styles.listItem}>
                <GoogleMapsImport navigation={navigation} />
              </View>
            </View>
          </FeatureFlag>
        ) : null}

        <View style={styles.section}>
          <SettingsListItem
            label={t('screen_titles.about')}
            onPress={navigateTo(Screens.About)}
          />
          <Divider />
          <SettingsListItem
            label={t('screen_titles.legal')}
            onPress={() => navigation.navigate(Screens.Licenses)}
            style={styles.lastListItem}
          />
        </View>

        {!isGPS ? (
          <View style={styles.section}>
            <SettingsListItem
              label='EN Debug Menu'
              onPress={navigateTo(Screens.ENDebugMenu)}
              style={styles.lastListItem}
            />
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={styles.section}>
            <SettingsListItem
              label='Feature Flags (Dev mode only)'
              onPress={navigateTo(Screens.FeatureFlags)}
              style={styles.lastListItem}
            />
          </View>
        ) : null}
      </ScrollView>
    </NavigationBarWrapper>
  );
};

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryBackgroundFaintShade,
  },
  divider: {
    marginHorizontal: Spacing.small,
    flex: 1,
    height: 1,
    backgroundColor: Colors.tertiaryViolet,
  },
  section: {
    flex: 1,
    backgroundColor: Colors.white,
    marginBottom: Spacing.medium,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.tertiaryViolet,
  },
  icon: {
    maxWidth: Spacing.icon,
    maxHeight: Spacing.icon,
  },
  listItem: {
    flex: 1,
    paddingHorizontal: Spacing.small,
    paddingVertical: Spacing.medium,
  },
  listItemText: {
    ...TypographyStyles.tappableListItem,
  },
  lastListItem: {
    borderBottomWidth: 0,
  },
  descriptionText: {
    ...TypographyStyles.description,
  },
});

export default SettingsScreen;
