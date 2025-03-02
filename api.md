# yupi API Documentation

This document provides detailed information about all available endpoints in the Yupi API.

## Table of Contents

- [Authentication](#authentication)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
  - [Get All Users](#get-all-users)
  - [Delete User](#delete-user)
- [Blog Management](#blog-management)
  - [Create Post](#create-post)
  - [Get Posts](#get-posts)
  - [Get Post by Slug](#get-post-by-slug)
  - [Update Post](#update-post)
  - [Delete Post](#delete-post)
- [Bill Splitting](#bill-splitting)

## Authentication

All authenticated endpoints require a valid JWT token to be included in the request header. 

**Authorization Header Format**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Register

Create a new user account (superuser only).

**URL**: `/auth/register`  
**Method**: `POST`  
**Auth required**: Yes (Superuser)  

**Request Body**:
```json
{
  "username": "string",
  "email": "user@example.com",
  "password": "string",
  "is_superuser": false
}
```

**Success Response**: `201 Created`
```json
{
  "id": 0,
  "uuid": "string",
  "username": "string",
  "email": "user@example.com",
  "is_superuser": false,
  "created_at": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request` - Username or email already registered
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions
- `422 Unprocessable Entity` - Validation error

### Login

Log in to obtain an access token.

**URL**: `/auth/login`  
**Method**: `POST`  
**Auth required**: No  

**Request Body** (form data):
```
username=string&password=string
```

**Success Response**: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Notes**:
- Access token is returned in the response
- Refresh token is set as an HTTP-only cookie

**Error Responses**:
- `401 Unauthorized` - Incorrect username or password
- `422 Unprocessable Entity` - Validation error

### Refresh Token

Get a new access token using the refresh token stored in cookies.

**URL**: `/auth/refresh`  
**Method**: `POST`  
**Auth required**: No (but requires refresh token cookie)  

**Success Response**: `200 OK`
```json
{
  "access_token": "string",
  "token_type": "bearer"
}
```

**Error Responses**:
- `401 Unauthorized` - Invalid refresh token
- `422 Unprocessable Entity` - Validation error

### Logout

Log out by clearing the refresh token cookie.

**URL**: `/auth/logout`  
**Method**: `POST`  
**Auth required**: No  

**Success Response**: `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

### Get All Users

Get a list of all users (superuser only).

**URL**: `/auth/users`  
**Method**: `GET`  
**Auth required**: Yes (Superuser)  

**Success Response**: `200 OK`
```json
[
  {
    "id": 0,
    "uuid": "string",
    "username": "string",
    "email": "user@example.com",
    "is_superuser": false,
    "created_at": "2023-01-01T00:00:00.000Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions

### Delete User

Delete a user by ID (superuser only).

**URL**: `/auth/users/{user_id}`  
**Method**: `DELETE`  
**Auth required**: Yes (Superuser)  

**URL Parameters**:
- `user_id` - The ID of the user to delete

**Success Response**: `200 OK`
```json
{
  "message": "User has been deleted successfully",
  "deleted_user": {
    "id": 0,
    "username": "string",
    "uuid": "string"
  }
}
```

**Error Responses**:
- `400 Bad Request` - Cannot delete own superuser account
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions
- `404 Not Found` - User not found

## Blog Management

### Create Post

Create a new blog post.

**URL**: `/blog/admin`  
**Method**: `POST`  
**Auth required**: Yes (Any authenticated user)  
**Status Code**: `201 Created`

**Request Body**:
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string (optional)",
  "tags": ["string"] (optional),
  "published": true
}
```

**Notes**:
- If `excerpt` is not provided, it will be automatically generated using AI
- If `tags` are not provided, they will be automatically generated using AI
- Post reading time is automatically calculated
- URL-friendly slug is automatically generated from the title

**Success Response**: `201 Created`
```json
{
  "id": 0,
  "uuid": "string",
  "title": "string",
  "slug": "string",
  "content": "string",
  "excerpt": "string",
  "tags": ["string"],
  "reading_time": 0,
  "published": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": 0,
    "username": "string"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `422 Unprocessable Entity` - Validation error

### Get Posts

Get a list of blog posts with various filtering options and pagination metadata.

**URL**: `/blog`  
**Method**: `GET`  
**Auth required**: No  
**Status Code**: `200 OK`

**Query Parameters**:
- `skip` (integer, optional) - Number of items to skip (default: 0)
- `limit` (integer, optional) - Maximum number of items to return (default: 3)
- `search` (string, optional) - Search term for filtering posts
- `tag` (string, optional) - Filter posts by specific tag
- `published_status` (string, optional) - Filter by published status: 'published' (default), 'unpublished', or 'all'

**Success Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 0,
      "uuid": "string",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "tags": ["string"],
      "reading_time": 0,
      "published": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "author": {
        "id": 0,
        "username": "string"
      }
    }
  ],
  "total_count": 42,
  "has_more": true,
  "limit": 3,
  "skip": 0
}
```

**Notes**:
- `total_count` represents the total number of posts matching your query (without pagination)
- `has_more` indicates whether there are more posts after the current page
- `limit` and `skip` echo back the pagination parameters you provided

**Error Responses**:
- `422 Unprocessable Entity` - Invalid query parameters

### Get Post by Slug

Get a specific blog post by its slug.

**URL**: `/blog/{slug}`  
**Method**: `GET`  
**Auth required**: No  
**Status Code**: `200 OK`

**URL Parameters**:
- `slug` - The slug of the post to retrieve

**Success Response**: `200 OK`
```json
{
  "id": 0,
  "uuid": "string",
  "title": "string",
  "slug": "string",
  "content": "string",
  "excerpt": "string",
  "tags": ["string"],
  "reading_time": 0,
  "published": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": 0,
    "username": "string"
  }
}
```

**Error Responses**:
- `404 Not Found` - Post not found

### Update Post

Update a blog post by ID (author or superuser only).

**URL**: `/blog/admin/{post_id}`  
**Method**: `PUT`  
**Auth required**: Yes (Post author or Superuser)  
**Status Code**: `200 OK`

**URL Parameters**:
- `post_id` - The ID of the post to update

**Request Body**:
```json
{
  "title": "string",
  "content": "string",
  "excerpt": "string",
  "tags": ["string"],
  "published": true
}
```

**Success Response**: `200 OK`
```json
{
  "id": 0,
  "uuid": "string",
  "title": "string",
  "slug": "string",
  "content": "string",
  "excerpt": "string",
  "tags": ["string"],
  "reading_time": 0,
  "published": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z",
  "author": {
    "id": 0,
    "username": "string"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions (not the author)
- `404 Not Found` - Post not found
- `422 Unprocessable Entity` - Validation error

### Delete Post

Delete a blog post by ID (superuser only).

**URL**: `/blog/admin/{post_id}`  
**Method**: `DELETE`  
**Auth required**: Yes (Superuser)  
**Status Code**: `200 OK`

**URL Parameters**:
- `post_id` - The ID of the post to delete

**Success Response**: `200 OK`
```json
{
  "message": "Post has been deleted successfully",
  "deleted_item": {
    "id": 0,
    "title": "string",
    "uuid": "string"
  }
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions
- `404 Not Found` - Post not found

## Bill Splitting

*Detailed documentation for Bill Splitting endpoints to be added* 