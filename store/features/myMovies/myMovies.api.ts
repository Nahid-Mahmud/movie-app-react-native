import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/baseApi";

// MyMovies Types
export interface MyMovie {
  id: string;
  title: string;
  movieId: string;
  genre: string[];
  year: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddMovieRequest {
  title: string;
  movieId: string;
  genre: string[];
  year: number;
}

export interface UpdateMovieRequest {
  title?: string;
  genre?: string[];
  year?: number;
}

export interface GetMyMoviesQuery {
  cursor?: string;
  limit?: number;
  search?: string;
  genre?: string;
  year?: number;
}

export interface MyMoviesResponse {
  data: MyMovie[];
  meta: {
    total: number;
    cursor?: string | null;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  meta?: {
    total?: number;
    cursor?: string | null;
  };
}

export const myMoviesApi = createApi({
  reducerPath: "myMoviesApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["MyMovies"],
  endpoints: (builder) => ({
    // Add movie to user's list
    addMovieToList: builder.mutation<ApiResponse<MyMovie>, AddMovieRequest>({
      query: (movieData) => ({
        url: "/my-movies",
        method: "POST",
        data: movieData,
      }),
      invalidatesTags: ["MyMovies"],
    }),

    // Get user's movies list with optional filters
    getMyMovies: builder.query<ApiResponse<MyMovie[]>, GetMyMoviesQuery>({
      query: (params = {}) => ({
        url: "/my-movies",
        method: "GET",
        params,
      }),
      providesTags: ["MyMovies"],
    }),

    // Get specific movie from user's list
    getMovieById: builder.query<ApiResponse<MyMovie>, string>({
      query: (movieId) => ({
        url: `/my-movies/${movieId}`,
        method: "GET",
      }),
      providesTags: (result, error, movieId) => [{ type: "MyMovies", id: movieId }],
    }),

    // Update movie in user's list
    updateMovie: builder.mutation<ApiResponse<MyMovie>, { id: string; data: UpdateMovieRequest }>({
      query: ({ id, data }) => ({
        url: `/my-movies/${id}`,
        method: "PATCH",
        data,
      }),
      invalidatesTags: (result, error, { id }) => ["MyMovies", { type: "MyMovies", id }],
    }),

    // Remove movie from user's list
    removeMovieFromList: builder.mutation<ApiResponse<null>, string>({
      query: (movieId) => ({
        url: `/my-movies/${movieId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MyMovies"],
    }),

    // Search movies with pagination
    searchMyMovies: builder.query<ApiResponse<MyMovie[]>, { search?: string; cursor?: string; limit?: number }>({
      query: (params) => ({
        url: "/my-movies",
        method: "GET",
        params,
      }),
      providesTags: ["MyMovies"],
      // Merge results for infinite scrolling
      serializeQueryArgs: ({ queryArgs, endpointName }) => {
        const { cursor, ...otherArgs } = queryArgs;
        return endpointName + JSON.stringify(otherArgs);
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.cursor) {
          // Append new items for pagination
          return {
            ...newItems,
            data: [...currentCache.data, ...newItems.data],
          };
        }
        // Replace cache for new searches
        return newItems;
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        // Force refetch if search term changes
        return currentArg?.search !== previousArg?.search;
      },
    }),

    // Get movies by genre
    getMoviesByGenre: builder.query<ApiResponse<MyMovie[]>, { genre: string; cursor?: string; limit?: number }>({
      query: (params) => ({
        url: "/my-movies",
        method: "GET",
        params,
      }),
      providesTags: ["MyMovies"],
    }),

    // Get movies by year
    getMoviesByYear: builder.query<ApiResponse<MyMovie[]>, { year: number; cursor?: string; limit?: number }>({
      query: (params) => ({
        url: "/my-movies",
        method: "GET",
        params,
      }),
      providesTags: ["MyMovies"],
    }),
  }),
});

export const {
  useAddMovieToListMutation,
  useGetMyMoviesQuery,
  useGetMovieByIdQuery,
  useUpdateMovieMutation,
  useRemoveMovieFromListMutation,
  useSearchMyMoviesQuery,
  useGetMoviesByGenreQuery,
  useGetMoviesByYearQuery,
  useLazyGetMyMoviesQuery,
  useLazySearchMyMoviesQuery,
  useLazyGetMoviesByGenreQuery,
  useLazyGetMoviesByYearQuery,
} = myMoviesApi;
