import { useState } from "react";
import { ResizeMode, Video } from "expo-av";
import { View, Text, TouchableOpacity, Image, Modal, TouchableWithoutFeedback } from "react-native";

import { icons } from "../constants";

const VideoCard = ({ title, creator, avatar, thumbnail, video, description }) => {
  const [play, setPlay] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [descriptionVisible, setDescriptionVisible] = useState(false);

  const handleIconPress = () => {
    setModalVisible(true);
  };

  const handleOptionPress = (option) => {
    console.log(option);
    setModalVisible(false);
    // Handle the option selection logic here
  };

  const toggleDescription = () => {
    setDescriptionVisible(!descriptionVisible);
  };

  return (
    <View style={{ height: 300 }} className="flex flex-col items-center px-4 mb-14 flex-shrink">
      <View className="flex flex-row gap-3 items-start">
        <View className="flex justify-center items-center flex-row flex-1">
          <View className="w-11 h-11 rounded-lg border border-secondary flex justify-center items-center p-0.5">
            <Image
              source={{ uri: avatar }}
              className="w-full h-full rounded-lg"
              resizeMode="cover"
            />
          </View>

          <View className="flex justify-center flex-1 ml-3 gap-y-1">
            <Text onPress={toggleDescription} className="font-psemibold text-sm text-white" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-gray-100 font-pregular" numberOfLines={1}>
              {creator}
            </Text>
          </View>
        </View>

        <View className="pt-2">
          <TouchableOpacity onPress={handleIconPress} className="w-5 h-5">
            <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" />
          </TouchableOpacity>

          <Modal
            transparent={true}
            visible={modalVisible}
            animationType="slide"
            onRequestClose={() => setModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View className="flex-1 bg-transparent bg-opacity-50" />
            </TouchableWithoutFeedback>
            <View className="absolute bottom-0 left-0 right-0 bg-primary p-5 rounded-t-lg">
              <TouchableOpacity className="p-4 border-b bg-primary border-gray-300" onPress={() => handleOptionPress('Follow')}>
                <Text className="text-lg color-white fw-bold">Follow</Text>
              </TouchableOpacity>
              <TouchableOpacity className="p-4" onPress={() => handleOptionPress('Bookmark')}>
                <Text className="text-lg color-white">Bookmark</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </View>
      </View>

      {descriptionVisible && (
        <View className="w-full mt-2 px-1">
          <Text className="text-white text-sm">{description}</Text>
        </View>
      )}

      {play ? (
        <Video
          source={{ uri: video }}
          className="w-full h-60 rounded-xl mt-3"
          resizeMode={ResizeMode.CONTAIN}
          useNativeControls
          shouldPlay
          onPlaybackStatusUpdate={(status) => {
            if (status.didJustFinish) {
              setPlay(false);
            }
          }}
        />
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setPlay(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: thumbnail }}
            className="w-full h-full rounded-xl"
            resizeMode="cover"
          />

          <Image
            source={icons.play}
            className="w-12 h-12 absolute"
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoCard;
