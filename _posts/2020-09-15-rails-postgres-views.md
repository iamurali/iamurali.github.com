---
toc: true
layout: post
description: Rails + postgresql views/materialized views with versioning and usages
permalink: /2020-09-15-rails-postgres-views/
categories: [postgres, rails, views]
title: Rails with postgresql views by leveraging active record entity models
---
# Rails with postgresql views by leveraging active record entity models

## Problem Statement

We had a use case where we had to generate a report in an existing meeting scheduler system. This report shows all the data of report around meeting. 

While showing the report it involes the most complex logic based on role, meetings, meeting attendees, meeting customer information, meeting notes that being captrued. There are around 20+ filters present around the reports. 

We had to expose an endpoint which gives back information in a format of attendee and respective meeting. It could be csv, excel or any other format. 

- <img src = "../images/db_views_schema.png"/>

# Lets try heavy lifting in ruby

