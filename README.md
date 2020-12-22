# TD Mock server description
## Json for defind mock APIs
   - name       : name of API
   - url        : enpoint of API (Should be unique)
   - mothod     : http mothod of API
   - scenarios  : scenarios of API
     - name                 : name of scenario
     - isEnable             : enable or disable for using scenario value true is enable , false is disable
     - response             : default response
     - isResponseTransfrom  : enable or disable for custom transfrom response value true is enalne , false is disable
     - responseTransfrom    : template for custom transfrom response
     - responseStatusCode   : http status code for response
     - delay                : number of delay response time
     - webHook              : if to use webhook after api responsed
       - isEnable               : enable or disable for using webhook value true is enalne , false is disable
       - config                 : config for webhook
         - url                  : url for webhook
         - method               : umethodrl for webhook
         - headers              : headers for webhook
         - isDataTransfrom      : enable or disable for using transfrom data before sent to webhook value true is enalne , false is disable
         - dataTransfrom        : template for custom transfrom data before sent to webhook


## How to using Template transform
### reference https://selecttransform.github.io/site/transform.html

1. Basic
Use {{ }} notation to fill out a template with data to generate a new JSON

```
Template  

{
  "menu": {
    "flavor": "{{flavor}}",
    "richness": "{{richness}}",
    "garlic amount": "{{garlic_amount}}",
    "green onion?": "{{green_onion}}",
    "sliced pork?": "{{pork_amount}}",
    "secret sauce": "{{sauce_amount}}",
    "noodle's texture": "{{texture}}"
  }
}

Data 

{
  "flavor": "strong",
  "richness": "ultra rich",
  "garlic_amount": "1 clove",
  "green_onion": "thin green onion",
  "pork_amount": "with",
  "sauce_amount": "double",
  "texture": "extra firm"
}


Result

{
  "menu": {
    "flavor": "strong",
    "richness": "ultra rich",
    "garlic amount": "1 clove",
    "green onion?": "thin green onion",
    "sliced pork?": "with",
    "secret sauce": "double",
    "noodle's texture": "extra firm"
  }
}
```

2. Loop
Use #each to iterate through items
```
Template 

{
  "orders": {
    "{{#each customers}}": {
      "order": "One {{menu}} for {{name}}!"
    }
  }
}

Data 

{
  "customers": [
      {
        "name": "Hatter",
        "menu": "miso ramen"
      }, 
      {
        "name": "March Hare",
        "menu": "tonkotsu ramen"
      }, 
      {
        "name": "Dormouse",
        "menu": "miso ramen"
     }, 
     {
        "name": "Alice",
        "menu": "cup noodles"
    }
]
}

Result

{
  "orders": [
      {
        "order": "One miso ramen for Hatter!"
      }, 
      {
        "order": "One tonkotsu ramen for March Hare!"
      }, 
      {
        "order": "One miso ramen for Dormouse!"
      }, 
      {
        "order": "One cup noodles for Alice!"
      }
]
}
```

3. Conditional
Use #if/#elseif/#else to selectively fill out a template
```
Template  

{
  "response": [{
    "{{#if spicy < 7}}": {
      "message": "Coming right up!"
    }
  }, {
    "{{#elseif spicy < 9}}": {
      "message": "Are you sure? It is very spicy"
    }
  }, {
    "{{#else}}": {
      "message": "Please sign here where it says you're responsible for this decision"
    }
  }]
}

Data

{
  "spicy": 8
}


Result

{
  "response": {
    "message": "Are you sure? It is very spicy"
  }
}
```

4. Existential Operator
You can use the existential operator #? to exclude an attribute altogether if the template evaluates to a falsy value.

```
Template 

 {
  tabs: [{
    text: "home",
    badge: "{{#? notifications.home}}"
  }, {
    text: "message",
    badge: "{{#? notification.message}}"
  }, {
    text: "invite",
    badge: "{{#? notification.invite}}"
  }]
}


Data

 {
  notifications: {
    home: 1,
    invite: 2
  }
};


Result

{
  tabs: [{
    text: "home",
    badge: 1
  }, {
    text: "message"
  }, {
    text: "invite",
    badge: 2
  }]
}
```


5. Concat
You can concatenate multiple items and arrays into a single array using the #concat operator.

```
Template 

{
  "items": {
    "{{#concat}}": [
      {
        "type": "label",
        "text": "Length: {{numbers.length}}"
      },
      {
        "{{#each numbers}}": {
          "type": "label",
          "text": "{{this}}"
        }
      }
    ]
  }
}

Data 

{
  numbers: [1,2,3]
}

Result

{
  "items": [
      {
      "type": "label",
      "text": "Length: 3"
    }, 
    {
      "type": "label",
      "text": 1
    }, 
    {
      "type": "label",
      "text": 2
    }, 
    {
      "type": "label",
      "text": 3
    }
 ]
}

```

6. Merge
You can merge multiple objects into a single object using the #merge operator. If there are any overlapping attributes, the ones that come later will override the previously set attribute.

```
Template 

{
  "{{#merge}}": [
    {
      "type": "label",
      "text": "Length: {{numbers.length}}"
    },
    {
      "style": {
        "align": "{{align}}",
        "size": "{{size}}"
      },
      "action": {
        "type": "$render"
      }
    }
  ]
}

Data 

{
  numbers: [1,2,3],
  align: "right",
  size: "14"
}

Result

{
  "type": "label",
  "text": "Length: 3",
  "style": {
    "align": "right",
    "size": "14"
  },
  "action": {
    "type": "$render"
  }
}

```

7. Inline JavaScript
You can use ANY native javascript expression inside the template.

```
Template 

{
  "ranking": {
    "{{#each players.sort(function(p1, p2) { return p2.quantity - p1.quantity; }) }}": "{{name}} ate {{quantity}}"
  },
  "winner": "{{players.sort(function(p1, p2) { return p2.quantity - p1.quantity; })[0].name }}"
}

Data 

{
  "players": [
      {
       "name": "Alice",
       "quantity": 102
      }, 
      {
       "name": "Mad Hatter",
       "quantity": 108
     }, 
     {
       "name": "Red Queen",
       "quantity": 100
    }
]
}

Result

{
  "ranking": [
    "Mad Hatter ate 108",
    "Alice ate 102",
    "Red Queen ate 100"
  ],
  "winner": "Mad Hatter"
}

```

8. $root
Sometimes you need to refer to the root data object while iterating through an #each loop.
In this case you can use a special keyword named $root.

```
Template 

{
  "{{#each posts}}": [
    "{{content}}",
    "{{$root.users[user_id]}}"
  ]
}

Data  

{
  users: ["Alice", "Bob", "Carol"],
  posts: [
      {
        content: "Show me the money",
        user_id: 1
     }, 
     {
        content: "hello world",
        user_id: 0
     }, 
     {
        content: "what is the meaning of life?",
        user_id: 2
  }]
}

Result

[
  ["Show me the money", "Bob"],
  ["hello world", "Alice"],
  ["what is the meaning of life?", "Carol"]
]
```

9. $index
You can use a special variable named $index within #each loops.

```
Template  

{
  "rows": {
    "{{#each items}}": {
      "row_number": "{{$index}}",
      "columns": {
        "{{#each this}}": {
          "content": "{{this}}",
          "column_number": "{{$index}}"
        }
      }
    }
  }
}

Data  
{
  "items": [
    ['a','b','c','d','e'],
    [1,2,3,4,5]
  ]
}


Result

{
  "rows": [
    {
      "row_number": 0,
      "columns": [
        {
          "content": "a",
          "column_number": 0
        },
        {
          "content": "b",
          "column_number": 1
        },
        {
          "content": "c",
          "column_number": 2
        },
        {
          "content": "d",
          "column_number": 3
        },
        {
          "content": "e",
          "column_number": 4
        }
      ]
    },
    {
      "row_number": 1,
      "columns": [
        {
          "content": 1,
          "column_number": 0
        },
        {
          "content": 2,
          "column_number": 1
        },
        {
          "content": 3,
          "column_number": 2
        },
        {
          "content": 4,
          "column_number": 3
        },
        {
          "content": 5,
          "column_number": 4
        }
      ]
    }
  ]
}
```