"""GET /api/leads/for-me/ — unified provider inbox (Bark-style labels)."""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Lead, LeadAssignment
from .serializers import ProviderForMeAssignmentSerializer
from .test_lead_utils import exclude_test_leads


class ForMePagination(PageNumberPagination):
    page_size = 50
    max_page_size = 100


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leads_for_me(request):
    """List this provider's lead assignments with display_status for inbox UI."""
    user = request.user
    if not user.is_provider:
        return Response({"detail": "Only providers can access this endpoint."}, status=403)

    valid_ids = exclude_test_leads(Lead.objects.all()).values_list("id", flat=True)
    qs = (
        LeadAssignment.objects.filter(provider=user, lead_id__in=valid_ids)
        .select_related("lead", "lead__service_category", "lead__client")
        .order_by("-assigned_at")
    )

    paginator = ForMePagination()
    page = paginator.paginate_queryset(qs, request)
    ser = ProviderForMeAssignmentSerializer(
        page if page is not None else qs,
        many=True,
        context={"request": request},
    )
    if page is not None:
        return paginator.get_paginated_response(ser.data)
    return Response(ser.data)
