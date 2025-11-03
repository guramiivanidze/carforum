from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.db.models import Q, Count
from .models import (
    Category, Topic, Reply, UserProfile, ReportReason, Report, Bookmark, 
    Poll, PollOption, PollVote, TopicImage, Tag
)
from .serializers import (
    CategorySerializer, TopicSerializer, TopicDetailSerializer,
    ReplySerializer, UserSerializer, UserProfileSerializer, ReportReasonSerializer, ReportSerializer, 
    BookmarkSerializer, PollSerializer, TagSerializer
)
from .pagination import CustomPageNumberPagination
from gamification.services import GamificationService


class CategoryViewSet(viewsets.ModelViewSet):
    """API endpoint for categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        """Get paginated topics for this category"""
        category = self.get_object()
        
        # Get topics for this category, ordered by creation date (newest first)
        topics = Topic.objects.filter(category=category).select_related(
            'author', 'author__profile', 'category'
        ).order_by('-created_at')
        
        # Apply pagination
        paginator = CustomPageNumberPagination()
        page = paginator.paginate_queryset(topics, request)
        
        if page is not None:
            serializer = TopicSerializer(page, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        
        serializer = TopicSerializer(topics, many=True, context={'request': request})
        return Response(serializer.data)


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for tags"""
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular tags by usage count"""
        tags = Tag.objects.all()
        # Sort by usage_count (property)
        sorted_tags = sorted(tags, key=lambda tag: tag.usage_count, reverse=True)
        # Limit to top 10
        top_tags = sorted_tags[:10]
        serializer = self.get_serializer(top_tags, many=True)
        return Response(serializer.data)


class TopicViewSet(viewsets.ModelViewSet):
    """API endpoint for topics"""
    queryset = Topic.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TopicDetailSerializer
        return TopicSerializer
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create topic with images and poll"""
        try:
            # Create the topic
            topic_data = {
                'title': request.data.get('title'),
                'content': request.data.get('content'),
                'category': request.data.get('category'),
            }
            
            # Handle tags (can be from FormData or JSON)
            if hasattr(request.data, 'getlist'):
                # FormData request
                tag_names = request.data.getlist('tags')
            else:
                # JSON request
                tag_names = request.data.get('tags', [])
            
            # Convert tag names to Tag objects (create if needed)
            tag_objects = []
            if tag_names:
                from django.utils.text import slugify
                for tag_name in tag_names:
                    if tag_name and tag_name.strip():
                        tag, created = Tag.objects.get_or_create(
                            name=tag_name.strip().lower(),
                            defaults={'slug': slugify(tag_name.strip())}
                        )
                        tag_objects.append(tag.id)
            
            if tag_objects:
                topic_data['tag_ids'] = tag_objects
            
            serializer = self.get_serializer(data=topic_data)
            serializer.is_valid(raise_exception=True)
            topic = serializer.save(author=request.user)
            
            # Handle images (check if FormData or JSON)
            if hasattr(request.data, 'getlist'):
                # FormData request
                images = request.FILES.getlist('images')
                captions = request.data.getlist('image_captions')
                orders = request.data.getlist('image_orders')
                
                for idx, image_file in enumerate(images):
                    TopicImage.objects.create(
                        topic=topic,
                        image=image_file,
                        caption=captions[idx] if idx < len(captions) else '',
                        order=int(orders[idx]) if idx < len(orders) else idx
                    )
            
            # Handle poll (check if FormData or JSON)
            poll_question = request.data.get('poll_question')
            if poll_question:
                poll = Poll.objects.create(
                    topic=topic,
                    question=poll_question
                )
                
                # Get poll options
                if hasattr(request.data, 'getlist'):
                    # FormData request
                    poll_options = request.data.getlist('poll_options')
                    poll_orders = request.data.getlist('poll_option_orders')
                else:
                    # JSON request
                    poll_options = request.data.get('poll_options', [])
                    poll_orders = request.data.get('poll_option_orders', [])
                
                for idx, option_text in enumerate(poll_options):
                    if option_text and option_text.strip():  # Only create if option has text
                        PollOption.objects.create(
                            poll=poll,
                            text=option_text,
                            order=int(poll_orders[idx]) if idx < len(poll_orders) else idx
                        )
            
            # Return the complete topic with images and poll
            # Reload topic with related objects
            from django.db.models import Prefetch
            topic = Topic.objects.prefetch_related(
                'images',
                'poll__options__votes'
            ).select_related('author__profile', 'category').get(id=topic.id)
            
            # Track gamification for topic creation
            gamification_result = GamificationService.track_topic_created(request.user)
            
            headers = self.get_success_headers(serializer.data)
            topic_serializer = TopicDetailSerializer(topic, context={'request': request})
            response_data = topic_serializer.data
            
            # Add gamification data to response
            response_data['gamification'] = gamification_result
            
            print(f"Topic created with ID: {topic.id}")
            print(f"Images count: {topic.images.count()}")
            print(f"Has poll: {hasattr(topic, 'poll')}")
            if hasattr(topic, 'poll'):
                print(f"Poll options count: {topic.poll.options.count()}")
            print(f"Response images: {len(response_data.get('images', []))}")
            print(f"Response poll: {response_data.get('poll')}")
            return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            import traceback
            print(f"Error creating topic: {str(e)}")
            print(traceback.format_exc())
            raise
    
    def update(self, request, *args, **kwargs):
        """Update topic with images and poll"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Check if user is the author
            if instance.author != request.user:
                return Response(
                    {'detail': 'You do not have permission to edit this topic.'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Prepare topic data
            topic_data = {
                'title': request.data.get('title'),
                'content': request.data.get('content'),
                'category': request.data.get('category'),
            }
            
            # Handle tags (can be from FormData or JSON)
            if hasattr(request.data, 'getlist'):
                # FormData request
                tag_names = request.data.getlist('tags')
            else:
                # JSON request
                tag_names = request.data.get('tags', [])
            
            # Convert tag names to Tag objects (create if needed)
            tag_objects = []
            if tag_names:
                from django.utils.text import slugify
                for tag_name in tag_names:
                    if tag_name and tag_name.strip():
                        tag, created = Tag.objects.get_or_create(
                            name=tag_name.strip().lower(),
                            defaults={'slug': slugify(tag_name.strip())}
                        )
                        tag_objects.append(tag.id)
            
            if tag_objects:
                topic_data['tag_ids'] = tag_objects
            
            serializer = self.get_serializer(instance, data=topic_data, partial=partial)
            serializer.is_valid(raise_exception=True)
            topic = serializer.save()
            
            # Handle images - only process new images
            if hasattr(request.data, 'getlist'):
                # FormData request
                images = request.FILES.getlist('images')
                captions = request.data.getlist('image_captions')
                orders = request.data.getlist('image_orders')
                
                for idx, image_file in enumerate(images):
                    # Only create if there's an actual file (not null)
                    if image_file:
                        TopicImage.objects.create(
                            topic=topic,
                            image=image_file,
                            caption=captions[idx] if idx < len(captions) else '',
                            order=int(orders[idx]) if idx < len(orders) else idx
                        )
            
            # Handle poll - update or create
            poll_question = request.data.get('poll_question')
            if poll_question:
                # Check if poll exists
                if hasattr(topic, 'poll'):
                    # Update existing poll
                    poll = topic.poll
                    poll.question = poll_question
                    poll.save()
                    # Delete old options
                    poll.options.all().delete()
                else:
                    # Create new poll
                    poll = Poll.objects.create(
                        topic=topic,
                        question=poll_question
                    )
                
                # Get poll options
                if hasattr(request.data, 'getlist'):
                    # FormData request
                    poll_options = request.data.getlist('poll_options')
                    poll_orders = request.data.getlist('poll_option_orders')
                else:
                    # JSON request
                    poll_options = request.data.get('poll_options', [])
                    poll_orders = request.data.get('poll_option_orders', [])
                
                for idx, option_text in enumerate(poll_options):
                    if option_text and option_text.strip():
                        PollOption.objects.create(
                            poll=poll,
                            text=option_text,
                            order=int(poll_orders[idx]) if idx < len(poll_orders) else idx
                        )
            
            # Return the updated topic with images and poll
            from django.db.models import Prefetch
            topic = Topic.objects.prefetch_related(
                'images',
                'poll__options__votes'
            ).select_related('author__profile', 'category').get(id=topic.id)
            
            topic_serializer = TopicDetailSerializer(topic, context={'request': request})
            return Response(topic_serializer.data)
        except Exception as e:
            import traceback
            print(f"Error updating topic: {str(e)}")
            print(traceback.format_exc())
            raise
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['get'])
    def increment_views(self, request, pk=None):
        """Increment topic views"""
        topic = self.get_object()
        topic.views += 1
        topic.save()
        return Response({'views': topic.views})
    
    @action(detail=True, methods=['get'])
    def related(self, request, pk=None):
        """Get related topics with at least 3 matching tags"""
        topic = self.get_object()
        
        # Get topic tags
        topic_tags = list(topic.tags.values_list('name', flat=True))
        
        if not topic_tags or len(topic_tags) < 3:
            return Response([])
        
        # Get all topics from the same category (excluding current topic)
        from django.db.models import Count, Q
        
        # Build query to find topics with matching tags
        related_topics = Topic.objects.filter(
            category=topic.category
        ).exclude(
            id=topic.id
        ).prefetch_related('tags', 'author')
        
        # Filter and annotate with matching tags count
        topics_with_matches = []
        for t in related_topics:
            t_tags = list(t.tags.values_list('name', flat=True))
            matching_tags = set(topic_tags) & set(t_tags)
            matches_count = len(matching_tags)
            
            if matches_count >= 3:
                topics_with_matches.append({
                    'topic': t,
                    'matches': matches_count
                })
        
        # Sort by number of matches (descending)
        topics_with_matches.sort(key=lambda x: x['matches'], reverse=True)
        
        # Get top 5 topics
        top_topics = [item['topic'] for item in topics_with_matches[:5]]
        
        # Serialize the topics
        serializer = TopicSerializer(top_topics, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def replies(self, request, pk=None):
        """Create a reply for this topic"""
        topic = self.get_object()
        serializer = ReplySerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(author=request.user, topic=topic)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a topic"""
        topic = self.get_object()
        user = request.user
        
        # Prevent users from liking their own topics
        if topic.author == user:
            return Response(
                {'error': 'You cannot like your own topic'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user in topic.likes.all():
            # Unlike
            topic.likes.remove(user)
            return Response({
                'status': 'unliked',
                'user_has_liked': False,
                'likes_count': topic.likes.count()
            })
        else:
            # Like
            topic.likes.add(user)
            
            # Check for topic likes badges for the author
            from gamification.services import GamificationService
            badges_unlocked = GamificationService.check_topic_likes_badges(topic.author)
            
            response_data = {
                'status': 'liked',
                'user_has_liked': True,
                'likes_count': topic.likes.count()
            }
            
            # Include badge info if any were unlocked
            if badges_unlocked:
                response_data['badges_unlocked'] = badges_unlocked
            
            return Response(response_data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def bookmark(self, request, pk=None):
        """Bookmark or unbookmark a topic"""
        topic = self.get_object()
        user = request.user
        
        # Prevent users from bookmarking their own topics
        if topic.author == user:
            return Response(
                {'error': 'You cannot bookmark your own topic'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        bookmark = Bookmark.objects.filter(user=user, topic=topic).first()
        
        if bookmark:
            # Unbookmark
            bookmark.delete()
            return Response({
                'status': 'unbookmarked',
                'user_has_bookmarked': False
            })
        else:
            # Bookmark
            Bookmark.objects.create(user=user, topic=topic)
            
            # Track gamification for bookmark creation
            gamification_result = GamificationService.track_bookmark_created(user)
            
            return Response({
                'status': 'bookmarked',
                'user_has_bookmarked': True,
                'gamification': gamification_result
            }, status=status.HTTP_201_CREATED)


class ReplyViewSet(viewsets.ModelViewSet):
    """API endpoint for replies"""
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create reply with gamification tracking"""
        response = super().create(request, *args, **kwargs)
        
        # Track gamification for reply creation
        gamification_result = GamificationService.track_reply_created(request.user)
        
        # Add gamification data to response
        response.data['gamification'] = gamification_result
        
        return response
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a reply"""
        reply = self.get_object()
        user = request.user
        
        # Prevent users from liking their own replies
        if reply.author == user:
            return Response(
                {'error': 'You cannot like your own reply.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if reply.likes.filter(id=user.id).exists():
            # Unlike
            reply.likes.remove(user)
            return Response({
                'status': 'unliked',
                'likes_count': reply.likes_count,
                'user_has_liked': False
            })
        else:
            # Like
            reply.likes.add(user)
            
            # Track gamification for the reply author receiving a like
            gamification_result = GamificationService.track_like_received(reply.author)
            
            return Response({
                'status': 'liked',
                'likes_count': reply.likes_count,
                'user_has_liked': True,
                'gamification': gamification_result
            })
    
    def destroy(self, request, *args, **kwargs):
        """Delete a reply - only the author can delete their own reply"""
        reply = self.get_object()
        
        # Check if the user is the author of the reply
        if reply.author != request.user:
            return Response(
                {'error': 'You can only delete your own replies.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Perform the deletion
        reply.delete()
        
        return Response(
            {'message': 'Reply deleted successfully.'},
            status=status.HTTP_204_NO_CONTENT
        )


class UserProfileViewSet(viewsets.ModelViewSet):
    """API endpoint for user profiles - lookup by user ID"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']  # Allow POST for custom actions
    
    def get_object(self):
        """Get profile by user ID instead of profile ID"""
        user_id = self.kwargs.get('pk')
        from django.contrib.auth.models import User
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('User not found')
        
        # Get or create profile for this user
        profile, created = UserProfile.objects.get_or_create(user=user)
        return profile
    
    @action(detail=False, methods=['get'])
    def top_members(self, request):
        """Get top members by points"""
        top_profiles = UserProfile.objects.order_by('-points')[:10]
        serializer = self.get_serializer(top_profiles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def replies(self, request, pk=None):
        """Get user's replies with report information - only for own profile"""
        from .serializers import ReplySerializer
        profile = self.get_object()
        
        # Check if user is viewing their own profile
        if not request.user.is_authenticated or profile.user != request.user:
            return Response(
                {'error': 'You can only view your own replies'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        replies = Reply.objects.filter(author=profile.user).select_related('topic', 'author').order_by('-created_at')
        
        # Add context to show resolved reports if viewing own profile
        serializer = ReplySerializer(replies, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def topics(self, request, pk=None):
        """Get user's topics"""
        profile = self.get_object()
        topics = Topic.objects.filter(author=profile.user).select_related('author', 'category').order_by('-created_at')
        serializer = TopicSerializer(topics, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def follow(self, request, pk=None):
        """Follow or unfollow a user (toggle)"""
        profile = self.get_object()
        target_user = profile.user
        user = request.user

        if user == target_user:
            return Response({'error': 'You cannot follow yourself.'}, status=status.HTTP_400_BAD_REQUEST)

        from .models import Follow

        following_record = Follow.objects.filter(follower=user, following=target_user).first()

        if following_record:
            # Unfollow
            following_record.delete()
            is_following = False
        else:
            # Follow
            Follow.objects.create(follower=user, following=target_user)
            is_following = True

        # Return updated follower counts
        followers_count = Follow.objects.filter(following=target_user).count()
        following_count = Follow.objects.filter(follower=target_user).count()

        return Response({
            'is_following': is_following,
            'followers_count': followers_count,
            'following_count': following_count
        })

    @action(detail=True, methods=['get'])
    def followers(self, request, pk=None):
        """Return list of users who follow this profile"""
        profile = self.get_object()
        target_user = profile.user

        from .models import Follow
        followers_qs = Follow.objects.filter(following=target_user).select_related('follower')

        # Extract follower users
        users = [f.follower for f in followers_qs]

        # Apply pagination
        paginator = CustomPageNumberPagination()
        page = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'])
    def following(self, request, pk=None):
        """Return list of users this profile is following"""
        profile = self.get_object()
        source_user = profile.user

        from .models import Follow
        following_qs = Follow.objects.filter(follower=source_user).select_related('following')
        users = [f.following for f in following_qs]

        paginator = CustomPageNumberPagination()
        page = paginator.paginate_queryset(users, request)
        serializer = UserSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)

    @action(detail=True, methods=['get'])
    def following_topics(self, request, pk=None):
        """Return topics authored by users this profile is following"""
        profile = self.get_object()
        source_user = profile.user

        from .models import Follow
        following_user_ids = Follow.objects.filter(follower=source_user).values_list('following_id', flat=True)

        topics = Topic.objects.filter(author_id__in=list(following_user_ids)).select_related('author', 'category').order_by('-created_at')

        paginator = CustomPageNumberPagination()
        page = paginator.paginate_queryset(topics, request)
        serializer = TopicSerializer(page, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def bookmarks(self, request, pk=None):
        """Get user's bookmarked topics - only for own profile"""
        profile = self.get_object()
        
        # Check if user is viewing their own profile
        if not request.user.is_authenticated or profile.user != request.user:
            return Response(
                {'error': 'You can only view your own bookmarks'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        bookmarks = Bookmark.objects.filter(user=profile.user).select_related('topic', 'topic__author', 'topic__category').order_by('-created_at')
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        """Upload user profile image"""
        profile = self.get_object()
        
        # Check if user is trying to upload to their own profile
        if profile.user != request.user:
            return Response(
                {'error': 'You can only upload images to your own profile.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get the uploaded file
        user_image = request.FILES.get('user_image')
        if not user_image:
            return Response(
                {'error': 'No image file provided.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_profile(self, request, pk=None):
        """Update user profile (first_name, last_name, bio)"""
        profile = self.get_object()
        
        # Check if user is trying to update their own profile
        if profile.user != request.user:
            return Response(
                {'error': 'You can only update your own profile.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Update first_name and last_name on User model if provided
        first_name = request.data.get('firstName')
        last_name = request.data.get('lastName')
        
        if first_name is not None:
            if not first_name.strip():
                return Response(
                    {'firstName': 'First name cannot be empty.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            profile.user.first_name = first_name.strip()
        
        if last_name is not None:
            if not last_name.strip():
                return Response(
                    {'lastName': 'Last name cannot be empty.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            profile.user.last_name = last_name.strip()
        
        # Save user changes
        if first_name is not None or last_name is not None:
            profile.user.save()
        
        # Update bio if provided
        bio = request.data.get('bio')
        if bio is not None:
            serializer = self.get_serializer(profile, data={'bio': bio}, partial=True)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Reload profile to get updated data
        profile.refresh_from_db()
        profile.user.refresh_from_db()
        serializer = self.get_serializer(profile)
        return Response({
            'message': 'Profile updated successfully',
            'profile': serializer.data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def change_password(self, request, pk=None):
        """Change user password"""
        from .serializers import PasswordChangeSerializer
        from django.contrib.auth.hashers import check_password
        
        profile = self.get_object()
        
        # Check if user is trying to change their own password
        if profile.user != request.user:
            return Response(
                {'error': 'You can only change your own password.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = PasswordChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify current password
        if not check_password(serializer.validated_data['current_password'], request.user.password):
            return Response(
                {'current_password': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response({
            'message': 'Password changed successfully. Please login again with your new password.'
        })

        # Validate file type
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if user_image.content_type not in allowed_types:
            return Response(
                {'error': 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate file size (max 5MB)
        max_size = 5 * 1024 * 1024  # 5MB in bytes
        if user_image.size > max_size:
            return Response(
                {'error': 'File size too large. Maximum size is 5MB.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete old image if exists
        if profile.user_image:
            profile.user_image.delete(save=False)
        
        # Save new image
        profile.user_image = user_image
        profile.save()
        
        # Return updated profile
        serializer = self.get_serializer(profile, context={'request': request})
        return Response(serializer.data)
    

class ReportReasonViewSet(viewsets.ReadOnlyModelViewSet):
    """API endpoint for report reasons"""
    queryset = ReportReason.objects.filter(is_active=True)
    serializer_class = ReportReasonSerializer


class ReportViewSet(viewsets.ModelViewSet):
    """API endpoint for reports"""
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own reports
        if self.request.user.is_staff:
            return Report.objects.all()
        return Report.objects.filter(reporter=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)
        
        # Check for reports badge
        from gamification.services import GamificationService
        badge_result = GamificationService.check_reports_badge(self.request.user)
        
        # Store badge info in the request for later use in create()
        self.request.badge_result = badge_result
    
    def create(self, request, *args, **kwargs):
        # Get the reply being reported
        reply_id = request.data.get('reply')
        
        # Check if reply exists and prevent self-reporting
        try:
            reply = Reply.objects.get(id=reply_id)
            if reply.author == request.user:
                return Response(
                    {'error': 'You cannot report your own reply.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Reply.DoesNotExist:
            return Response(
                {'error': 'Reply not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if user already reported this reply
        if Report.objects.filter(reply_id=reply_id, reporter=request.user).exists():
            return Response(
                {'error': 'You have already reported this reply.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create the report
        response = super().create(request, *args, **kwargs)
        
        # Add badge info to response if available
        if hasattr(request, 'badge_result') and request.badge_result['badge_unlocked']:
            response.data['badge_unlocked'] = request.badge_result['badge_unlocked']
        
        return response



@api_view(['GET'])
def search(request):
    """
    Search across topics, users, and categories
    Query params:
    - q: search query (required)
    - filter: 'all', 'topics', 'users', 'categories' (default: 'all')
    - category: filter by category ID
    - min_replies: minimum number of replies
    - sort: 'relevance', 'recent', 'popular' (default: 'relevance')
    """
    query = request.query_params.get('q', '').strip()
    filter_type = request.query_params.get('filter', 'all')
    category_id = request.query_params.get('category')
    min_replies = request.query_params.get('min_replies')
    sort_by = request.query_params.get('sort', 'relevance')
    
    # Convert string "null" to None
    if category_id in ['null', 'None', '']:
        category_id = None
    if min_replies in ['null', 'None', '']:
        min_replies = None
    
    if not query:
        return Response({
            'topics': [],
            'users': [],
            'categories': [],
            'total': 0
        })
    
    results = {
        'topics': [],
        'users': [],
        'categories': [],
        'total': 0
    }
    
    # Search Topics
    if filter_type in ['all', 'topics']:
        topics_query = Topic.objects.select_related(
            'author', 'author__profile', 'category'
        ).filter(
            Q(title__icontains=query) | 
            Q(content__icontains=query)
        )
        
        # Apply category filter
        if category_id:
            try:
                topics_query = topics_query.filter(category_id=int(category_id))
            except (ValueError, TypeError):
                pass  # Skip invalid category_id
        
        # Apply min replies filter
        if min_replies:
            try:
                topics_query = topics_query.annotate(
                    total_replies=Count('replies')
                ).filter(total_replies__gte=int(min_replies))
            except (ValueError, TypeError):
                pass  # Skip invalid min_replies
        
        # Apply sorting
        if sort_by == 'recent':
            topics_query = topics_query.order_by('-created_at')
        elif sort_by == 'popular':
            topics_query = topics_query.annotate(
                popularity=Count('replies') + Count('bookmarks')
            ).order_by('-popularity', '-views')
        else:  # relevance
            # Simple relevance: title matches first, then by engagement
            topics_query = topics_query.annotate(
                total_replies=Count('replies')
            ).order_by('-total_replies', '-views')
        
        topics = topics_query[:20]
        results['topics'] = TopicSerializer(topics, many=True, context={'request': request}).data
    
    # Search Users
    if filter_type in ['all', 'users']:
        users = User.objects.select_related('profile').filter(
            Q(username__icontains=query) |
            Q(email__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
        )[:10]
        
        results['users'] = [{
            'id': user.id,
            'username': user.username,
            'email': user.email if request.user.is_staff else None,
            'points': user.profile.points if hasattr(user, 'profile') else 0,
            'bio': user.profile.bio if hasattr(user, 'profile') else '',
        } for user in users]
    
    # Search Categories
    if filter_type in ['all', 'categories']:
        categories = Category.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query)
        )[:10]
        
        results['categories'] = CategorySerializer(categories, many=True).data
    
    # Calculate total results
    results['total'] = (
        len(results['topics']) + 
        len(results['users']) + 
        len(results['categories'])
    )
    
    return Response(results)


@api_view(['POST'])
def vote_poll(request, poll_id):
    """Vote on a poll option"""
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        poll = Poll.objects.get(id=poll_id)
    except Poll.DoesNotExist:
        return Response(
            {'error': 'Poll not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    option_id = request.data.get('option_id')
    if not option_id:
        return Response(
            {'error': 'option_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        option = PollOption.objects.get(id=option_id, poll=poll)
    except PollOption.DoesNotExist:
        return Response(
            {'error': 'Invalid poll option'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create or update vote
    vote, created = PollVote.objects.update_or_create(
        poll_option__poll=poll,
        user=request.user,
        defaults={'poll_option': option}
    )
    
    # Return updated poll data
    serializer = PollSerializer(poll, context={'request': request})
    return Response(serializer.data)
