from django.shortcuts import render, get_object_or_404, redirect
import json 
from django.contrib.auth import authenticate , login , logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie , csrf_exempt
from django.views.decorators.http import require_POST
from django.db.models import Q
from .models import Category, Item
# from django.contrib.auth.decorators import login_required


#Registration View 
@csrf_exempt
@require_POST
def register_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")
    confirm_password = data.get("confirm_password")
    email = data.get("email")
    full_name = data.get("full_name")

    if username is None or password is None or confirm_password is None or email is None or full_name is None:
        return JsonResponse({"detail": "Please provide all required information"}, status=400)

    if password != confirm_password:
        return JsonResponse({"detail": "Passwords do not match"}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"detail": "Username already exists"}, status=400)

    user = User.objects.create_user(username=username, password=password, email=email, first_name=full_name.split()[0], last_name=full_name.split()[1])
    login(request, user)
    return JsonResponse({"detail": "Successfully registered and logged in!"})



#Login View
@require_POST
def login_view(request):
    data = json.loads(request.body)
    username = data.get("username")
    password = data.get("password")

    if username is None or password is None :
        return JsonResponse({"detail":"Please provide username and password"})
    
    user = authenticate(username=username , password=password)
    if user is None :
        return JsonResponse({"detail":"invalid credentials"}, status=400)
    
    login(request, user)
    return JsonResponse({"detail":"Succesfully logged in !"})
    
def logout_view(request):
    if not request.user.is_authenticated :
        return JsonResponse({"detail":"You are not logged in !"})

    logout (request)
    return JsonResponse({"detail":"Succesfully logged out !"})

@ensure_csrf_cookie
def session_view(request):
    if not request.user.is_authenticated :
        return JsonResponse({"isauthenticated":False})
    
    return JsonResponse({"isauthenticated":True})
#View for the profile 
def whoami_view(request):
    if not request.user.is_authenticated :
        return JsonResponse({"isauthenticated":False})
    
    return JsonResponse({"username":request.user.username})

#Items view
def items(request):
    # query = request.GET.get('query', '')
    category_id = request.GET.get('category', 0)
    categories = Category.objects.all()
    items = Item.objects.filter(is_sold=False)

    if category_id:
        items = items.filter(category_id=category_id)

    # if query:
        # items = items.filter(Q(name__icontains=query) | Q(description__icontains=query))
    serialized_items = list(items.values())
    serialized_categories = list (categories.values())
    return JsonResponse( {
        'items': serialized_items,
        'categories': serialized_categories,
        'category_id': int(category_id)
    })

#details of each item
# def detail(request, pk):
#     item = get_object_or_404(Item, pk=pk)
#     related_items = Item.objects.filter(category=item.category, is_sold=False).exclude(pk=pk)[0:3]

#     return render(request, 'item/detail.html', {
#         'item': item,
#         'related_items': related_items
#     })
