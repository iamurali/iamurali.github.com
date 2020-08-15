---
toc: true
layout: post
description: Template Rendering with Dynamic context
categories: [ruby, erb, yml, templating, rails, ROR]
title: Template Rendering with Dynamic context
---
# Template Rendering with Dynamic context

## Problem Statement
In one of projects when we had to build a service to generate history for a particular entity if there are changes occurs. we had to build a template engine which can translate the entity changes in humar redable format. 

Formatting text as YAML:

```yaml
entity: Event
    - changes: 
        from: 2020-08-15
        to: 2020-08-17
- expected_format: "Event rescheduled event from Aug 15th to Augh 17th by bob (Current User)"
```

Solution: 

We have utilized the concept of `Binding` class able to encapsulate **execution context** of the receiver object.  

For simplicity we chose ERB, we can place them within locale files for internationalisation and can be edit them with ease if need arises.

Since we extend `OpenStruct` we can simply pass a hash to it during instantiation and all the keys will be accessible as methods and will be exposed directly during rendering.

```ruby
require 'erb'
require 'ostruct'

include ERB::Util

module AuditMessage
  class ErbTemplate < OpenStruct
    def render(template)
      ERB.new(template).result(binding)
    end

    def current_user
      # ===> Fetch current user
      user_id, user_type = self[:_audit].user_id, self[:_audit].user_type
      user_type.classify.constantize.find(user_id)
    rescue
      self[:user]
    end

    def system_user
      OpenStruct.new(name: "System User")
    end

    def get_old_value(field)
      # ===> Try to fetch the old value from the audit 
      #  {"field": ["old_value", "new_value"]}
      get_value(self[field])
    end

    def get_new_value(field)
      # ===> Try to fetch the old value from the audit 
      #  {"field": ["old_value", "new_value"]}
      get_value(self[field], "new_value")
    end

    def method_missing(method, *args, &block)
      respond_to?(method) ? self[method] : self[:_auditable].send(method, *args)
    end

    private

    def get_value(value, default_data="old_value")
      return if value.nil?
      return send(value) unless value.is_a?(Array)
      return default_data == "old_value" ? value.first : value.last
    end
  end
end
```


In the above example we have used ERB templating engine for parsing the text that we wanted with binding of current context.

We added extra methods like current_user who has changed the entity. This particular methods can be available through the context which can be used for back trace or additional info to be passed.

```yaml
entity:
    event: 
        update:
            message: >-
            <%= Event rescheduled event from #{format(old_value)} to #{format(old_value)} by #{current_user.name}" (Current User) %>
```


If we try to this particular example engine will look for the enity event and update action and generate custom message with the template passed to the parser. It tries to find the methods in the context of the current entity if there are any. 

The benefit of creating a separate abstraction is that it creates a sandbox environment for the template processing. This allows us to have more control over what gets exposed during processing and prevents accidental leakages into the context.


The main method here is the render method, where we utilise the ERB library. We create an ERB instance with the supplied template string and then call result, to which we supply the current execution context using the current binding.

The usage would look something like this :

```ruby
class Event
    attr_accessor :event_date
end
vars = { 
    old_value: "2020-08-15", 
    new_value: "2020-08-17"
 }
template_string = "entity.#{klass_name}.#{_action}.message"

AuditMessage::ErbTemplate.new(vars).render(template_string)
#===> result: "Event rescheduled event from Aug 15th to Augh 17th by bob (Current User)"
```