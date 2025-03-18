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

**Success Response**: `200 OK`
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
- `422 Unprocessable Entity` - Validation error

## Blog Management

Manage blog posts for the platform.

### Create Post

Create a new blog post.

**URL**: `/blog`  
**Method**: `POST`  
**Auth required**: Yes (Superuser)  

**Request Body**:
```json
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "featured_image": "string",
  "tags": ["tag1", "tag2"],
  "is_published": true
}
```

**Success Response**: `200 OK`
```json
{
  "id": 0,
  "uuid": "string",
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "featured_image": "string",
  "tags": ["tag1", "tag2"],
  "is_published": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions
- `422 Unprocessable Entity` - Validation error

### Get Posts

Get a list of blog posts with pagination and filtering options.

**URL**: `/blog`  
**Method**: `GET`  
**Auth required**: No  

**Query Parameters**:
- `skip` (integer, default=0) - Number of items to skip
- `limit` (integer, default=3) - Number of items to return
- `search` (string, optional) - Search term for title, excerpt, content, and tags
- `tag` (string, optional) - Filter by tag (case-insensitive)
- `status` (string, default="published") - Filter by status: 'published', 'unpublished', or 'all'

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
      "content": "string",
      "featured_image": "string",
      "tags": ["tag1", "tag2"],
      "is_published": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ],
  "total": 10,
  "has_more": true
}
```

**Notes**:
- Supports semantic search using OpenAI embeddings when search parameter is provided
- Default limit is 3 posts per page

### Get Post by Slug

Get a specific blog post by its slug.

**URL**: `/blog/{slug}`  
**Method**: `GET`  
**Auth required**: No  

**URL Parameters**:
- `slug` - The slug of the post to retrieve

**Success Response**: `200 OK`
```json
{
  "id": 0,
  "uuid": "string",
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "featured_image": "string",
  "tags": ["tag1", "tag2"],
  "is_published": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found` - Post not found

### Update Post

Update an existing blog post.

**URL**: `/blog/{slug}`  
**Method**: `PUT`  
**Auth required**: Yes (Superuser)  

**URL Parameters**:
- `slug` - The slug of the post to update

**Request Body**:
```json
{
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "featured_image": "string",
  "tags": ["tag1", "tag2"],
  "is_published": true
}
```

**Success Response**: `200 OK`
```json
{
  "id": 0,
  "uuid": "string",
  "title": "string",
  "slug": "string",
  "excerpt": "string",
  "content": "string",
  "featured_image": "string",
  "tags": ["tag1", "tag2"],
  "is_published": true,
  "created_at": "2023-01-01T00:00:00.000Z",
  "updated_at": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions
- `404 Not Found` - Post not found
- `422 Unprocessable Entity` - Validation error

### Delete Post

Delete a blog post.

**URL**: `/blog/{slug}`  
**Method**: `DELETE`  
**Auth required**: Yes (Superuser)  

**URL Parameters**:
- `slug` - The slug of the post to delete

**Success Response**: `200 OK`
```json
{
  "message": "Post deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enough permissions
- `404 Not Found` - Post not found

## Security

The API uses OAuth2 with password flow for authentication. Security is implemented using:

```
OAuth2PasswordBearer: {
  "type": "oauth2",
  "flows": {
    "password": {
      "scopes": {},
      "tokenUrl": "auth/login"
    }
  }
}
```