export const GENRES = [
  { id: "1", name: "Action", slug: "action", color: "#FF6B6B", icon: "⚔️" },
  { id: "2", name: "Adventure", slug: "adventure", color: "#4ECDC4", icon: "🗺️" },
  { id: "3", name: "Cars", slug: "cars", color: "#95E1D3", icon: "🏎️" },
  { id: "4", name: "Comedy", slug: "comedy", color: "#F9ED69", icon: "😂" },
  { id: "5", name: "Dementia", slug: "dementia", color: "#A8E6CF", icon: "🔮" },
  { id: "6", name: "Demons", slug: "demons", color: "#DCEDC1", icon: "😈" },
  { id: "7", name: "Drama", slug: "drama", color: "#FFAAA5", icon: "🎭" },
  { id: "8", name: "Ecchi", slug: "ecchi", color: "#FF8B94", icon: "🥵" },
  { id: "9", name: "Fantasy", slug: "fantasy", color: "#DDA0DD", icon: "🧙" },
  { id: "10", name: "Game", slug: "game", color: "#98D8C8", icon: "🎮" },
  { id: "11", name: "Harem", slug: "harem", color: "#F7DC6F", icon: "👨‍👩‍👧‍👦" },
  { id: "12", name: "Hentai", slug: "hentai", color: "#FF6B6B", icon: "🔞" },
  { id: "13", name: "Historical", slug: "historical", color: "#BB8FCE", icon: "🏯" },
  { id: "14", name: "Horror", slug: "horror", color: "#2C3E50", icon: "👻" },
  { id: "15", name: "Isekai", slug: "isekai", color: "#9B59B6", icon: "🌍" },
  { id: "16", name: "Josei", slug: "josei", color: "#E91E63", icon: "👩" },
  { id: "17", name: "Kids", slug: "kids", color: "#00BCD4", icon: "🧒" },
  { id: "18", name: "Magic", slug: "magic", color: "#8E44AD", icon: "✨" },
  { id: "19", name: "Martial Arts", slug: "martial-arts", color: "#E74C3C", icon: "🥋" },
  { id: "20", name: "Mecha", slug: "mecha", color: "#607D8B", icon: "🤖" },
  { id: "21", name: "Military", slug: "military", color: "#34495E", icon: "🎖️" },
  { id: "22", name: "Music", slug: "music", color: "#1ABC9C", icon: "🎵" },
  { id: "23", name: "Mystery", slug: "mystery", color: "#3498DB", icon: "🔍" },
  { id: "24", name: "Parody", slug: "parody", color: "#F39C12", icon: "😜" },
  { id: "25", name: "Police", slug: "police", color: "#7F8C8D", icon: "👮" },
  { id: "26", name: "Psychological", slug: "psychological", color: "#2C3E50", icon: "🧠" },
  { id: "27", name: "Romance", slug: "romance", color: "#E91E63", icon: "💕" },
  { id: "28", name: "Samurai", slug: "samurai", color: "#C0392B", icon: "🗡️" },
  { id: "29", name: "School", slug: "school", color: "#3498DB", icon: "🏫" },
  { id: "30", name: "Sci-Fi", slug: "sci-fi", color: "#00BCD4", icon: "🚀" },
  { id: "31", name: "Seinen", slug: "seinen", color: "#795548", icon: "👨" },
  { id: "32", name: "Shoujo", slug: "shoujo", color: "#FF69B4", icon: "👧" },
  { id: "33", name: "Shoujo Ai", slug: "shoujo-ai", color: "#FFB6C1", icon: "💗" },
  { id: "34", name: "Shounen", slug: "shounen", color: "#FF5722", icon: "👦" },
  { id: "35", name: "Shounen Ai", slug: "shounen-ai", color: "#FFB6C1", icon: "💙" },
  { id: "36", name: "Slice of Life", slug: "slice-of-life", color: "#AED6F1", icon: "☕" },
  { id: "37", name: "Space", slug: "space", color: "#2E86AB", icon: "🌌" },
  { id: "38", name: "Sports", slug: "sports", color: "#27AE60", icon: "⚽" },
  { id: "39", name: "Super Power", slug: "super-power", color: "#F1C40F", icon: "💪" },
  { id: "40", name: "Supernatural", slug: "supernatural", color: "#8E44AD", icon: "🔮" },
  { id: "41", name: "Thriller", slug: "thriller", color: "#34495E", icon: "😱" },
  { id: "42", name: "Vampire", slug: "vampire", color: "#8B0000", icon: "🧛" },
  { id: "43", name: "Yaoi", slug: "yaoi", color: "#FFB6C1", icon: "🍃" },
  { id: "44", name: "Yuri", slug: "yuri", color: "#FF69B4", icon: "🌸" },
  { id: "45", name: "Doujinshi", slug: "doujinshi", color: "#9B59B6", icon: "📖" },
  { id: "46", name: "Gender Bender", slug: "gender-bender", color: "#E91E63", icon: "🔄" },
] as const;

export const ANIME_TYPES = [
  { value: "TV", label: "TV Series" },
  { value: "MOVIE", label: "Movie" },
  { value: "OVA", label: "OVA" },
  { value: "SPECIAL", label: "Special" },
  { value: "ONA", label: "ONA" },
  { value: "MUSIC", label: "Music" },
] as const;

export const WATCH_STATUS = [
  { value: "watching", label: "Watching", color: "#4FA3D1" },
  { value: "completed", label: "Completed", color: "#27AE60" },
  { value: "paused", label: "Paused", color: "#F39C12" },
  { value: "dropped", label: "Dropped", color: "#E74C3C" },
  { value: "plantowatch", label: "Plan to Watch", color: "#9B59B6" },
] as const;

export const SORT_OPTIONS = [
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "SCORE_DESC", label: "Highest Rated" },
  { value: "TRENDING_DESC", label: "Trending Now" },
  { value: "LATEST_DESC", label: "Recently Added" },
  { value: "RELEASE_DATE_DESC", label: "Release Date" },
] as const;

export const SEASONS = [
  { value: "WINTER", label: "Winter", months: [1, 2, 3] },
  { value: "SPRING", label: "Spring", months: [4, 5, 6] },
  { value: "SUMMER", label: "Summer", months: [7, 8, 9] },
  { value: "FALL", label: "Fall", months: [10, 11, 12] },
] as const;

export const API_CACHE_TTL = {
  TRENDING: 1800, // 30 minutes
  POPULAR: 3600, // 1 hour
  SPOTLIGHT: 900, // 15 minutes
  SEARCH: 1800, // 30 minutes
  DETAIL: 86400, // 24 hours
  EPISODES: 3600, // 1 hour
} as const;

export const TRENDING_WEIGHTS = {
  VIEWS: 0.5,
  CLICKS: 0.3,
  WATCH_TIME: 0.2,
} as const;