-- DDL export time: 2026-04-09 22:03:46
-- Database engine: django.db.backends.mysql
-- Database name: fangying_db
-- Filter mode: all-tables
-- Table count: 20

-- Table: admin
CREATE TABLE `admin` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(128) NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: appointment
CREATE TABLE `appointment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `id_card` varchar(18) NOT NULL,
  `gender` smallint NOT NULL,
  `appointment_date` date NOT NULL,
  `time_slot` varchar(20) NOT NULL,
  `order_no` varchar(32) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` smallint NOT NULL,
  `remark` varchar(200) NOT NULL,
  `reject_reason` varchar(200) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `package_id` bigint DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `appointment_package_id_9e651438_fk_package_id` (`package_id`),
  KEY `appointment_user_id_e98b8296_fk_user_id` (`user_id`),
  CONSTRAINT `appointment_package_id_9e651438_fk_package_id` FOREIGN KEY (`package_id`) REFERENCES `package` (`id`),
  CONSTRAINT `appointment_user_id_e98b8296_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: article
CREATE TABLE `article` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `content` longtext NOT NULL,
  `cover_image` varchar(255) NOT NULL,
  `views_count` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: auth_group
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: auth_group_permissions
CREATE TABLE `auth_group_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: auth_permission
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: auth_user
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: auth_user_groups
CREATE TABLE `auth_user_groups` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `group_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_groups_user_id_group_id_94350c0c_uniq` (`user_id`,`group_id`),
  KEY `auth_user_groups_group_id_97559544_fk_auth_group_id` (`group_id`),
  CONSTRAINT `auth_user_groups_group_id_97559544_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `auth_user_groups_user_id_6a12ed8b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: auth_user_user_permissions
CREATE TABLE `auth_user_user_permissions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `permission_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_user_user_permissions_user_id_permission_id_14a6b632_uniq` (`user_id`,`permission_id`),
  KEY `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: banner
CREATE TABLE `banner` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(50) NOT NULL,
  `image` varchar(255) NOT NULL,
  `link` varchar(255) NOT NULL,
  `sort_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: category
CREATE TABLE `category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(200) NOT NULL,
  `icon` varchar(100) NOT NULL,
  `sort_order` int NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: consultation
CREATE TABLE `consultation` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` longtext NOT NULL,
  `reply` longtext NOT NULL,
  `status` smallint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `replied_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `consultation_user_id_b07c045f_fk_user_id` (`user_id`),
  CONSTRAINT `consultation_user_id_b07c045f_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: django_admin_log
CREATE TABLE `django_admin_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  `content_type_id` int DEFAULT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_auth_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`),
  CONSTRAINT `django_admin_log_chk_1` CHECK ((`action_flag` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: django_content_type
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: django_migrations
CREATE TABLE `django_migrations` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: django_session
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: favorite
CREATE TABLE `favorite` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `package_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorite_user_id_package_id_11045b66_uniq` (`user_id`,`package_id`),
  KEY `favorite_package_id_744ccb8d_fk_package_id` (`package_id`),
  CONSTRAINT `favorite_package_id_744ccb8d_fk_package_id` FOREIGN KEY (`package_id`) REFERENCES `package` (`id`),
  CONSTRAINT `favorite_user_id_8a5f8d2c_fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: package
CREATE TABLE `package` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` longtext NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `items` longtext NOT NULL,
  `suitable_for` varchar(200) NOT NULL,
  `notice` longtext NOT NULL,
  `sales_count` int NOT NULL,
  `views_count` int NOT NULL,
  `is_hot` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `category_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `package_category_id_288b11d7_fk_category_id` (`category_id`),
  CONSTRAINT `package_category_id_288b11d7_fk_category_id` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: report
CREATE TABLE `report` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `result_summary` longtext NOT NULL,
  `file_url` varchar(255) NOT NULL,
  `doctor` varchar(50) NOT NULL,
  `report_date` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `appointment_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  CONSTRAINT `report_appointment_id_7b87e477_fk_appointment_id` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: user
CREATE TABLE `user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `openid` varchar(100) NOT NULL,
  `nickname` varchar(50) NOT NULL,
  `avatar` varchar(200) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `real_name` varchar(50) NOT NULL,
  `id_card` varchar(18) NOT NULL,
  `gender` smallint NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
