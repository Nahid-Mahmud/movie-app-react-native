import { Link } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

const MovieCard = ({ movie }: { movie: Movie }) => {
  const rating = Math.round(Number(movie.vote_average));
  const year = movie.release_date?.split("-")[0];
  const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null;
  const placeholderUrl = "https://placehold.co/600x400/1a1a1a/ffffff.png";

  return (
    <Link href={`/movies/${movie.id}`} className="mb-5" asChild>
      <TouchableOpacity className="w-[30%]">
        <Image
          source={{ uri: posterUrl ? posterUrl : placeholderUrl }}
          className="w-full h-52 rounded-xl"
          resizeMode="cover"
        />
        <Text className="text-white mt-2 text-sm font-semibold" numberOfLines={1}>
          {movie.title}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-white mt-1 text-sm">{year}</Text>
          <Text className="text-yellow-400 mt-1 text-sm font-bold">{rating} ⭐</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default MovieCard;
