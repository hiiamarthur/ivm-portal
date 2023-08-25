USE [iVendingDB_IVM]
GO

IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Machine_AD]') AND type in (N'U'))
DROP TABLE [dbo].[Machine_AD]
GO

SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Machine_AD](
	[MA_MachineID] [varchar](10) NOT NULL,
	[MA_AdFileName] [varchar](50) NOT NULL,
	[MA_AdFileType] [varchar](10) NOT NULL,
	[MA_Active] [tinyint] NOT NULL DEFAULT 0,
	[MA_AdType] [tinyint] NOT NULL,
	[MA_Order] [tinyint] NOT NULL DEFAULT 1,
	[MA_Config] [varchar](max) NOT NULL DEFAULT '{}',
	[MA_DateFrom] [datetime] NOT NULL DEFAULT GETDATE(),
	[MA_DateTo] [datetime] NOT NULL,
	[MA_UploadTime] [datetime] NOT NULL DEFAULT GETDATE(),
	[MA_LastUpdate] [datetime] NOT NULL DEFAULT GETDATE(),
	[MA_ADID] [varchar](100) NOT NULL DEFAULT '',
	CONSTRAINT Machine_AD_PRIMARY_KEY PRIMARY KEY CLUSTERED (MA_ADID)
	
)
GO