USE [master]
GO
/****** Object:  Database [Gestor_Casos]    Script Date: 20-12-2024 18:38:39 ******/
CREATE DATABASE [Gestor_Casos]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'Gestor_Casos', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Gestor_Casos.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'Gestor_Casos_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\Gestor_Casos_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [Gestor_Casos] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [Gestor_Casos].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [Gestor_Casos] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [Gestor_Casos] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [Gestor_Casos] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [Gestor_Casos] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [Gestor_Casos] SET ARITHABORT OFF 
GO
ALTER DATABASE [Gestor_Casos] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [Gestor_Casos] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [Gestor_Casos] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [Gestor_Casos] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [Gestor_Casos] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [Gestor_Casos] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [Gestor_Casos] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [Gestor_Casos] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [Gestor_Casos] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [Gestor_Casos] SET  DISABLE_BROKER 
GO
ALTER DATABASE [Gestor_Casos] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [Gestor_Casos] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [Gestor_Casos] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [Gestor_Casos] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [Gestor_Casos] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [Gestor_Casos] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [Gestor_Casos] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [Gestor_Casos] SET RECOVERY FULL 
GO
ALTER DATABASE [Gestor_Casos] SET  MULTI_USER 
GO
ALTER DATABASE [Gestor_Casos] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [Gestor_Casos] SET DB_CHAINING OFF 
GO
ALTER DATABASE [Gestor_Casos] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [Gestor_Casos] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [Gestor_Casos] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [Gestor_Casos] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'Gestor_Casos', N'ON'
GO
ALTER DATABASE [Gestor_Casos] SET QUERY_STORE = ON
GO
ALTER DATABASE [Gestor_Casos] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [Gestor_Casos]
GO
/****** Object:  Table [dbo].[Casos_Consulta]    Script Date: 20-12-2024 18:38:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Casos_Consulta](
	[id_consulta] [int] IDENTITY(1,1) NOT FOR REPLICATION NOT NULL,
	[rut_cliente] [nchar](16) NOT NULL,
	[nombre_cliente] [nchar](50) NOT NULL,
	[correo_cliente] [nchar](50) NOT NULL,
	[estado] [bit] NOT NULL,
 CONSTRAINT [PK_Casos_Consulta] PRIMARY KEY CLUSTERED 
(
	[rut_cliente] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Detalle]    Script Date: 20-12-2024 18:38:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Detalle](
	[id_detalles] [int] IDENTITY(1,1) NOT NULL,
	[cliente_rut] [nchar](16) NOT NULL,
	[fecha] [date] NOT NULL,
	[detalle] [nchar](2000) NOT NULL,
 CONSTRAINT [PK_Detalle] PRIMARY KEY CLUSTERED 
(
	[id_detalles] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Usuarios]    Script Date: 20-12-2024 18:38:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuarios](
	[id_usuario] [nchar](10) NOT NULL,
	[nombre_usuario] [nchar](50) NOT NULL,
	[password_usuario] [nchar](50) NOT NULL,
	[correo_usuario] [nchar](50) NOT NULL,
	[imagen_perfil] [image] NULL,
 CONSTRAINT [PK_Usuarios] PRIMARY KEY CLUSTERED 
(
	[id_usuario] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Casos_Consulta] ON 

INSERT [dbo].[Casos_Consulta] ([id_consulta], [rut_cliente], [nombre_cliente], [correo_cliente], [estado]) VALUES (4, N'10.123.123-1    ', N'ejemplo3                                          ', N'ejemplo@gmail.com                                 ', 1)
INSERT [dbo].[Casos_Consulta] ([id_consulta], [rut_cliente], [nombre_cliente], [correo_cliente], [estado]) VALUES (13, N'12.345.654-5    ', N'Roben                                             ', N'roben@gmail.cl                                    ', 0)
INSERT [dbo].[Casos_Consulta] ([id_consulta], [rut_cliente], [nombre_cliente], [correo_cliente], [estado]) VALUES (9, N'12.352.457-4    ', N'Ejemplo Completo                                  ', N'completo@gmail.ccl                                ', 1)
SET IDENTITY_INSERT [dbo].[Casos_Consulta] OFF
GO
SET IDENTITY_INSERT [dbo].[Detalle] ON 

INSERT [dbo].[Detalle] ([id_detalles], [cliente_rut], [fecha], [detalle]) VALUES (4, N'10.123.123-1    ', CAST(N'2024-12-07' AS Date), N'Este es un ejemplo de detalle para un cliente Ejemplo2                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          ')
SET IDENTITY_INSERT [dbo].[Detalle] OFF
GO
INSERT [dbo].[Usuarios] ([id_usuario], [nombre_usuario], [password_usuario], [correo_usuario], [imagen_perfil]) VALUES (N'1         ', N'Admin                                             ', N'1234                                              ', N'admin@gmail.com                                   ', NULL)
GO
ALTER TABLE [dbo].[Detalle]  WITH CHECK ADD  CONSTRAINT [FK_Detalle_Casos_Consulta] FOREIGN KEY([cliente_rut])
REFERENCES [dbo].[Casos_Consulta] ([rut_cliente])
GO
ALTER TABLE [dbo].[Detalle] CHECK CONSTRAINT [FK_Detalle_Casos_Consulta]
GO
USE [master]
GO
ALTER DATABASE [Gestor_Casos] SET  READ_WRITE 
GO
