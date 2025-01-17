
## API Reference

#### Get all users
```http
  GET /api/users
```

#### Create users

```http
  POST /api/users/
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | **Required**.  |
| `email`      | `string` | **Required**.  |
| `role`      | `string` | **Required**.  |


#### Update users

```http
  PUT /api/users/
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `user_id`      | `integer` | **Required**.  |
| `name`      | `string` | **Required**.  |
| `email`      | `string` | **Required**. |
| `role`      | `string` | **Required**.  |

#### Delete users
```http
  DELETE /api/users/
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `user_id`      | `integer` | **Required**.  |
