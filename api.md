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
  "deleted_item": {
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
**Status Code**: `200 OK`

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
- If `tags` are not provided, they will be automatically generated using AI based on the content and existing tags in the system
- Post reading time is automatically calculated
- URL-friendly slug is automatically generated from the title
- Post embeddings for vector search are generated using the title, excerpt, and a preview of the content

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
- `422 Unprocessable Entity` - Validation error

### Get Posts

Get all published blog posts. Supports pagination and filtering.

**URL**: `/blog`  
**Method**: `GET`  
**Auth required**: No  

**Query Parameters:**

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `skip` | integer | Number of posts to skip (default: 0) |
| `limit` | integer | Number of posts per page (default: 3) |
| `search` | string | Search query to filter posts by title or content |
| `tag` | string | Filter posts by tag (case-insensitive) |
| `published_status` | string | Filter by publication status: 'published' (default), 'unpublished', or 'all' |
| `use_rag` | boolean | When true and search is provided, uses vector search with OpenAI embeddings (default: false) |

**Success Response**: `200 OK`
```json
{
  "items": [
    {
      "id": 0,
      "title": "string",
      "excerpt": "string",
      "reading_time": 0,
      "tags": ["string"],
      "author": {
        "id": 0,
        "username": "string",
        "email": "string"
      },
      "created_at": "2023-01-01T00:00:00.000Z",
      "slug": "string",
      "published": true
    }
  ],
  "total_count": 0,
  "has_more": false,
  "limit": 3,
  "skip": 0
}
```

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
    "username": "string",
    "email": "string"
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
  "excerpt": "string (optional)",
  "tags": ["string"] (optional),
  "published": true
}
```

**Notes**:
- If `excerpt` is not provided or empty, it will be automatically regenerated using AI
- If `tags` are not provided or empty, they will be automatically generated using AI based on the content and existing tags in the system
- Slug is automatically updated if title changes
- Reading time is recalculated if content changes
- Post embeddings are regenerated if title or excerpt changes

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
    "username": "string",
    "email": "string"
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