// import React, { useRef, useState } from 'react';
// import { View, Dimensions, PanResponder, Animated } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import Ionicons from 'react-native-vector-icons/Ionicons';

// const { width, height } = Dimensions.get('window');

// const data = [
//   { id: 1, color: '#ADD8E6' },
//   { id: 2, color: '#90EE90' },
//   { id: 3, color: '#FFFFE0' },
//   { id: 4, color: '#FFA07A' },
//   { id: 5, color: '#FFB6C1' },
// ];

// export default function App() {
//   const position = useRef(new Animated.ValueXY()).current;
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [swipeDirection, setSwipeDirection] = useState(null);

//   const iconOpacity = position.x.interpolate({
//     inputRange: [-width / 2, 0, width / 2],
//     outputRange: [0.3, 1, 0.3],
//     extrapolate: 'clamp',
//   });

//   const rotate = position.x.interpolate({
//     inputRange: [-width / 2, 0, width / 2],
//     outputRange: ['-30deg', '0deg', '30deg'],
//     extrapolate: 'clamp',
//   });

//   const nextCard = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % data.length);
//     position.setValue({ x: 0, y: 0 });
//     setSwipeDirection(null);
//   };

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: () => true,
//       onPanResponderMove: (event, gesture) => {
//         position.setValue({ x: gesture.dx, y: gesture.dy });
//         if (gesture.dx > 0) {
//           setSwipeDirection('right');
//         } else if (gesture.dx < 0) {
//           setSwipeDirection('left');
//         }
//       },
//       onPanResponderRelease: (event, gesture) => {
//         if (gesture.dx > 120 || gesture.dx < -120) {
//           Animated.timing(position, {
//             toValue: { x: gesture.dx > 120 ? width + 100 : -width - 100, y: gesture.dy },
//             duration: 250,
//             useNativeDriver: true,
//           }).start(() => nextCard());
//         } else {
//           Animated.spring(position, {
//             toValue: { x: 0, y: 0 },
//             useNativeDriver: true,
//           }).start();
//           setSwipeDirection(null);
//         }
//       },
//     })
//   ).current;

//   return (
//     <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f8f8', justifyContent: 'center', alignItems: 'center' }}>
//       <View style={{ position: 'absolute', width: width, height: height * 0.7, alignItems: 'center', justifyContent: 'center' }}>
//         {data.map((item, index) => {
//           if (index < currentIndex) return null;

//           const isCurrentCard = index === currentIndex;
//           const translateY = isCurrentCard ? position.y : 20 * (index - currentIndex);
//           const translateX = isCurrentCard ? position.x : 0;
//           const scale = isCurrentCard ? 1 : 0.95 ** (index - currentIndex);

//           return (
//             <Animated.View
//               key={item.id}
//               {...(isCurrentCard ? panResponder.panHandlers : {})}
//               style={{
//                 position: 'absolute',
//                 width: width * 0.9,
//                 height: height * 0.7,
//                 borderRadius: 20,
//                 backgroundColor: item.color,
//                 zIndex: data.length - index,
//                 justifyContent: 'center',
//                 alignItems: 'center',
//                 shadowColor: '#000',
//                 shadowOffset: { width: 0, height: 10 },
//                 shadowOpacity: 0.1,
//                 shadowRadius: 5,
//                 elevation: 5,
//                 transform: [
//                   { translateX: isCurrentCard ? translateX : 0 },
//                   { translateY: isCurrentCard ? translateY : 20 * (index - currentIndex) },
//                   { scale },
//                   { rotate: isCurrentCard ? rotate : '0deg' },
//                 ],
//               }}
//             >
//               {isCurrentCard && swipeDirection === 'right' && (
//                 <Animated.View
//                   style={{
//                     position: 'absolute',
//                     top: 20,
//                     left: 20,
//                     padding: 20,
//                     backgroundColor: 'green',
//                     borderRadius: 50,
//                     opacity: iconOpacity,
//                   }}
//                 >
//                   <Ionicons name="checkmark-outline" size={50} color="white" />
//                 </Animated.View>
//               )}
//               {isCurrentCard && swipeDirection === 'left' && (
//                 <Animated.View
//                   style={{
//                     position: 'absolute',
//                     top: 20,
//                     right: 20,
//                     padding: 20,
//                     backgroundColor: 'red',
//                     borderRadius: 50,
//                     opacity: iconOpacity,
//                   }}
//                 >
//                   <Ionicons name="close-outline" size={50} color="white" />
//                 </Animated.View>
//               )}
//             </Animated.View>
//           );
//         })}
//       </View>
//     </SafeAreaView>
//   );
// }
