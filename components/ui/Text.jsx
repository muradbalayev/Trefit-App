import { Text } from 'react-native';
import Fonts from '@/constants/Fonts';
import Colors from '@/constants/Colors';

export default function AppText(props) {
  return <Text {...props} style={[{  fontFamily: Fonts.Geist[props.font] || Fonts.Geist.Regular, color: Colors.TEXT }, props.style]} />;
}
